from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, selectinload

from app.ai.meeting_analyzer import run_analysis
from app.core.config import get_settings
from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.action_item import ActionItem
from app.models.ai_results import Decision, Topic
from app.models.meeting import Meeting, MeetingParticipant
from app.models.user import User
from app.schemas.meeting import (
    ActionItemOut,
    DecisionOut,
    MeetingCreate,
    MeetingListOut,
    MeetingOut,
    MeetingUpdate,
    ParticipantOut,
    TopicOut,
    TranscriptIn,
)
from app.services.access import get_accessible_meeting

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

ALLOWED_UPLOAD_TYPES = {"text/plain", "text/markdown", ""}
ALLOWED_EXT = (".txt", ".md", ".transcript")


def _serialize(meeting: Meeting) -> MeetingOut:
    participants = [
        ParticipantOut(id=p.id, user_id=p.user_id, name=p.user.name if p.user else "", email=p.user.email if p.user else "")
        for p in meeting.participants
    ]
    actions = [
        ActionItemOut(
            id=a.id, meeting_id=a.meeting_id, title=a.title, description=a.description or "",
            assigned_to=a.assigned_to, assignee_name=a.assignee.name if a.assignee else None,
            deadline=a.deadline, status=a.status, priority=a.priority, ai_generated=a.ai_generated,
        )
        for a in meeting.action_items
    ]
    return MeetingOut(
        id=meeting.id, title=meeting.title, description=meeting.description or "",
        date=meeting.date, duration_minutes=meeting.duration_minutes,
        organizer_id=meeting.organizer_id,
        organizer_name=meeting.organizer.name if meeting.organizer else "",
        transcript=meeting.transcript or "", summary=meeting.summary or "", status=meeting.status,
        participants=participants, action_items=actions,
        decisions=[DecisionOut.model_validate(d) for d in meeting.decisions],
        topics=[TopicOut.model_validate(t) for t in meeting.topics],
        created_at=meeting.created_at, updated_at=meeting.updated_at,
    )


def _visible_query(db: Session, user: User):
    q = db.query(Meeting).options(
        selectinload(Meeting.organizer),
        selectinload(Meeting.participants).selectinload(MeetingParticipant.user),
        selectinload(Meeting.action_items),
    )
    if user.role in ("MANAGER", "ADMIN"):
        return q
    part_ids = [r[0] for r in db.query(MeetingParticipant.meeting_id).filter_by(user_id=user.id).all()]
    return q.filter(or_(Meeting.organizer_id == user.id, Meeting.id.in_(part_ids or [-1])))


@router.get("", response_model=list[MeetingListOut])
def list_meetings(
    search: str = Query(default=""),
    status_: str = Query(default="", alias="status"),
    date_from: str = Query(default=""),
    date_to: str = Query(default=""),
    sort: str = Query(default="date_desc"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = _visible_query(db, user)
    if search:
        like = f"%{search.strip()}%"
        q = q.filter(or_(Meeting.title.ilike(like), Meeting.description.ilike(like)))
    if status_:
        q = q.filter(Meeting.status == status_.upper())
    try:
        if date_from:
            q = q.filter(Meeting.date >= datetime.fromisoformat(date_from))
        if date_to:
            q = q.filter(Meeting.date <= datetime.fromisoformat(date_to))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date filter. Use ISO format.")
    q = q.order_by(Meeting.date.asc() if sort == "date_asc" else Meeting.date.desc())
    out = []
    for m in q.all():
        total = len(m.action_items)
        done = sum(1 for a in m.action_items if a.status == "COMPLETED")
        out.append(MeetingListOut(
            id=m.id, title=m.title, date=m.date, status=m.status,
            organizer_name=m.organizer.name if m.organizer else "",
            task_count=total, completed_tasks=done,
        ))
    return out


@router.post("", response_model=MeetingOut, status_code=status.HTTP_201_CREATED)
def create_meeting(payload: MeetingCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    meeting = Meeting(
        title=payload.title.strip(), description=payload.description.strip(),
        date=payload.date or datetime.utcnow(), duration_minutes=payload.duration_minutes,
        organizer_id=user.id,
    )
    db.add(meeting)
    db.flush()
    seen = {user.id}
    for uid in payload.participant_ids:
        if uid in seen:
            continue
        if db.get(User, uid) is None:
            raise HTTPException(status_code=400, detail=f"Participant user {uid} does not exist.")
        seen.add(uid)
        db.add(MeetingParticipant(meeting_id=meeting.id, user_id=uid))
    db.commit()
    full = db.query(Meeting).options(
        selectinload(Meeting.organizer),
        selectinload(Meeting.participants).selectinload(MeetingParticipant.user),
        selectinload(Meeting.action_items).selectinload(ActionItem.assignee),
        selectinload(Meeting.decisions), selectinload(Meeting.topics),
    ).get(meeting.id)
    return _serialize(full)


@router.get("/{meeting_id}", response_model=MeetingOut)
def get_meeting(meeting_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    meeting = db.query(Meeting).options(
        selectinload(Meeting.organizer),
        selectinload(Meeting.participants).selectinload(MeetingParticipant.user),
        selectinload(Meeting.action_items).selectinload(ActionItem.assignee),
        selectinload(Meeting.decisions), selectinload(Meeting.topics),
    ).get(meeting_id)
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found.")
    get_accessible_meeting(db, meeting_id, user)
    return _serialize(meeting)


@router.put("/{meeting_id}", response_model=MeetingOut)
def update_meeting(meeting_id: int, payload: MeetingUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    meeting = get_accessible_meeting(db, meeting_id, user)
    if meeting.organizer_id != user.id and user.role not in ("MANAGER", "ADMIN"):
        raise HTTPException(status_code=403, detail="Only the organizer or a manager can edit this meeting.")
    if payload.title is not None:
        meeting.title = payload.title.strip()
    if payload.description is not None:
        meeting.description = payload.description.strip()
    if payload.date is not None:
        meeting.date = payload.date
    if payload.duration_minutes is not None:
        meeting.duration_minutes = payload.duration_minutes
    if payload.summary is not None:
        meeting.summary = payload.summary.strip()  # employee-edited AI suggestion
    if payload.participant_ids is not None:
        db.query(MeetingParticipant).filter_by(meeting_id=meeting.id).delete()
        for uid in set(payload.participant_ids):
            if db.get(User, uid) is None:
                raise HTTPException(status_code=400, detail=f"Participant user {uid} does not exist.")
            db.add(MeetingParticipant(meeting_id=meeting.id, user_id=uid))
    meeting.updated_at = datetime.utcnow()
    db.commit()
    return get_meeting(meeting_id, db, user)


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    meeting = get_accessible_meeting(db, meeting_id, user)
    if meeting.organizer_id != user.id and user.role not in ("MANAGER", "ADMIN"):
        raise HTTPException(status_code=403, detail="Only the organizer or a manager can delete this meeting.")
    db.delete(meeting)
    db.commit()
    return None


@router.put("/{meeting_id}/transcript", response_model=MeetingOut)
def save_transcript(meeting_id: int, payload: TranscriptIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    meeting = get_accessible_meeting(db, meeting_id, user)
    meeting.transcript = payload.transcript.strip()
    meeting.status = "NOT_PROCESSED"
    meeting.updated_at = datetime.utcnow()
    db.commit()
    return get_meeting(meeting_id, db, user)


@router.post("/{meeting_id}/upload", response_model=MeetingOut)
async def upload_transcript(meeting_id: int, file: UploadFile, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    settings = get_settings()
    meeting = get_accessible_meeting(db, meeting_id, user)
    name = (file.filename or "").lower()
    if not (file.content_type in ALLOWED_UPLOAD_TYPES or name.endswith(ALLOWED_EXT)):
        raise HTTPException(status_code=400, detail="Only .txt / .md transcript files are accepted.")
    raw = await file.read()
    if len(raw) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File is too large (max 512 KB).")
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 text.")
    if len(text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Transcript content is empty.")
    meeting.transcript = text.strip()[:200000]
    meeting.status = "NOT_PROCESSED"
    meeting.updated_at = datetime.utcnow()
    db.commit()
    return get_meeting(meeting_id, db, user)


@router.post("/{meeting_id}/analyze", response_model=MeetingOut)
def analyze_meeting(meeting_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    meeting = get_accessible_meeting(db, meeting_id, user)
    if not meeting.transcript or len(meeting.transcript.strip()) < 10:
        raise HTTPException(status_code=400, detail="Add a transcript before running analysis.")
    meeting.status = "PROCESSING"
    db.commit()
    result, error = run_analysis(meeting.transcript, title=meeting.title)
    if result is None:
        meeting.status = "FAILED"
        db.commit()
        raise HTTPException(status_code=502, detail=error or "AI analysis failed.")
    # Replace previous AI artifacts (human edits to tasks/decisions made via
    # their own endpoints are preserved only if ai_generated=False)
    db.query(ActionItem).filter_by(meeting_id=meeting.id, ai_generated=True).delete()
    db.query(Decision).filter_by(meeting_id=meeting.id, ai_generated=True).delete()
    db.query(Topic).filter_by(meeting_id=meeting.id).delete()
    meeting.summary = result.summary
    for d in result.decisions:
        db.add(Decision(meeting_id=meeting.id, description=d, ai_generated=True))
    for t in result.topics:
        db.add(Topic(meeting_id=meeting.id, name=t))
    # Resolve assignee names to users (case-insensitive); leave null when unsure
    users = db.query(User).all()
    by_name = {u.name.lower().strip(): u for u in users}
    for a in result.action_items:
        assignee_id = by_name.get((a.assignee_name or "").lower().strip()) if a.assignee_name else None
        db.add(ActionItem(
            meeting_id=meeting.id, title=a.title.strip(), description=(a.description or "").strip(),
            assigned_to=assignee_id, status="TODO", priority=a.priority, ai_generated=True,
        ))
    meeting.status = "PROCESSED"
    meeting.updated_at = datetime.utcnow()
    db.commit()
    return get_meeting(meeting_id, db, user)
