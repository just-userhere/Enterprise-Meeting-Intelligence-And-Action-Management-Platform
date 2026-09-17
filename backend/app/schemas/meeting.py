from datetime import datetime

from pydantic import BaseModel, Field


class MeetingCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(default="", max_length=5000)
    date: datetime | None = None
    duration_minutes: int = Field(default=30, ge=5, le=1440)
    participant_ids: list[int] = Field(default_factory=list)


class MeetingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    date: datetime | None = None
    duration_minutes: int | None = Field(default=None, ge=5, le=1440)
    summary: str | None = Field(default=None, max_length=20000)
    participant_ids: list[int] | None = None


class TranscriptIn(BaseModel):
    transcript: str = Field(min_length=10, max_length=200000)


class ParticipantOut(BaseModel):
    id: int
    user_id: int
    name: str
    email: str


class ActionItemOut(BaseModel):
    id: int
    meeting_id: int
    title: str
    description: str = ""
    assigned_to: int | None = None
    assignee_name: str | None = None
    deadline: datetime | None = None
    status: str
    priority: str
    ai_generated: bool = False

    model_config = {"from_attributes": True}


class DecisionOut(BaseModel):
    id: int
    description: str
    ai_generated: bool = False

    model_config = {"from_attributes": True}


class TopicOut(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class MeetingOut(BaseModel):
    id: int
    title: str
    description: str = ""
    date: datetime
    duration_minutes: int
    organizer_id: int
    organizer_name: str = ""
    transcript: str = ""
    summary: str = ""
    status: str
    participants: list[ParticipantOut] = []
    action_items: list[ActionItemOut] = []
    decisions: list[DecisionOut] = []
    topics: list[TopicOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MeetingListOut(BaseModel):
    id: int
    title: str
    date: datetime
    status: str
    organizer_name: str = ""
    task_count: int = 0
    completed_tasks: int = 0

    model_config = {"from_attributes": True}
