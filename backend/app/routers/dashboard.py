from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.action_item import ActionItem
from app.models.meeting import Meeting, MeetingParticipant
from app.models.user import User

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _meeting_ids(db: Session, user: User) -> list[int] | None:
    """None means unrestricted (manager/admin)."""
    if user.role in ("MANAGER", "ADMIN"):
        return None
    part = [r[0] for r in db.query(MeetingParticipant.meeting_id).filter_by(user_id=user.id).all()]
    org = [r[0] for r in db.query(Meeting.id).filter_by(organizer_id=user.id).all()]
    return list(set(part + org))


def _task_query(db: Session, user: User):
    q = db.query(ActionItem)
    if user.role not in ("MANAGER", "ADMIN"):
        org_ids = [r[0] for r in db.query(Meeting.id).filter_by(organizer_id=user.id).all()]
        q = q.filter(or_(ActionItem.assigned_to == user.id, ActionItem.meeting_id.in_(org_ids or [-1])))
    return q


@router.get("")
def get_dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    ids = _meeting_ids(db, user)

    mq = db.query(Meeting)
    if ids is not None:
        mq = mq.filter(Meeting.id.in_(ids or [-1]))

    tq = _task_query(db, user)
    pending = tq.filter(ActionItem.status.in_(["TODO", "IN_PROGRESS"])).count()
    completed = _task_query(db, user).filter(ActionItem.status == "COMPLETED").count()
    overdue = _task_query(db, user).filter(
        ActionItem.status != "COMPLETED",
        ActionItem.deadline.is_not(None),
        ActionItem.deadline < now,
    ).count()

    upcoming = (
        _task_query(db, user)
        .filter(ActionItem.status != "COMPLETED")
        .order_by(ActionItem.deadline.is_(None), ActionItem.deadline.asc())
        .limit(5)
        .all()
    )
    recent = mq.order_by(Meeting.date.desc()).limit(5).all()

    # Meetings per week (last 8 weeks) for a simple activity trend
    per_week = []
    for i in range(7, -1, -1):
        start = now - timedelta(days=(i + 1) * 7)
        end = now - timedelta(days=i * 7)
        qq = db.query(func.count(Meeting.id)).filter(Meeting.date >= start, Meeting.date < end)
        if ids is not None:
            qq = qq.filter(Meeting.id.in_(ids or [-1]))
        per_week.append({"week": f"-{i}w", "count": qq.scalar() or 0})

    return {
        "meetings": {
            "total": mq.count(),
            "this_week": mq.filter(Meeting.date >= week_ago).count(),
            "this_month": mq.filter(Meeting.date >= month_ago).count(),
        },
        "tasks": {"pending": pending, "completed": completed, "overdue": overdue},
        "upcoming_deadlines": [
            {"id": t.id, "title": t.title, "deadline": t.deadline, "status": t.status,
             "priority": t.priority, "meeting_id": t.meeting_id}
            for t in upcoming
        ],
        "recent_meetings": [
            {"id": m.id, "title": m.title, "date": m.date, "status": m.status} for m in recent
        ],
        "meetings_per_week": per_week,
    }
