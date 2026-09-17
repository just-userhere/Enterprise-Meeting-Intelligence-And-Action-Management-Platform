"""Authorization helper: a user may access a meeting if they organized it,
participate in it, or hold MANAGER/ADMIN role."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.meeting import Meeting, MeetingParticipant
from app.models.user import User


def get_accessible_meeting(db: Session, meeting_id: int, user: User) -> Meeting:
    meeting = db.get(Meeting, meeting_id)
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found.")
    if user.role in ("MANAGER", "ADMIN"):
        return meeting
    if meeting.organizer_id == user.id:
        return meeting
    is_participant = (
        db.query(MeetingParticipant)
        .filter_by(meeting_id=meeting.id, user_id=user.id)
        .first()
        is not None
    )
    if is_participant:
        return meeting
    raise HTTPException(status_code=403, detail="You do not have access to this meeting.")
