from datetime import datetime

from pydantic import BaseModel, Field

VALID_STATUS = {"TODO", "IN_PROGRESS", "COMPLETED"}
VALID_PRIORITY = {"LOW", "MEDIUM", "HIGH"}


class TaskCreate(BaseModel):
    meeting_id: int
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(default="", max_length=5000)
    assigned_to: int | None = None
    deadline: datetime | None = None
    priority: str = "MEDIUM"

    def clean_priority(self) -> str:
        p = (self.priority or "MEDIUM").upper()
        return p if p in VALID_PRIORITY else "MEDIUM"


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    assigned_to: int | None = None
    deadline: datetime | None = None
    status: str | None = None
    priority: str | None = None


class TaskOut(BaseModel):
    id: int
    meeting_id: int
    meeting_title: str = ""
    title: str
    description: str = ""
    assigned_to: int | None = None
    assignee_name: str | None = None
    deadline: datetime | None = None
    status: str
    priority: str
    overdue: bool = False

    model_config = {"from_attributes": True}
