from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(512), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="EMPLOYEE")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organized_meetings: Mapped[list["Meeting"]] = relationship(
        "Meeting", back_populates="organizer", foreign_keys="Meeting.organizer_id"
    )
    participations: Mapped[list["MeetingParticipant"]] = relationship(
        "MeetingParticipant", back_populates="user", cascade="all, delete-orphan"
    )
    assigned_tasks: Mapped[list["ActionItem"]] = relationship(
        "ActionItem", back_populates="assignee", foreign_keys="ActionItem.assigned_to"
    )
