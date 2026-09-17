from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.action_item import ActionItem
from app.models.meeting import Meeting
from app.models.user import User
from app.schemas.task import VALID_PRIORITY, VALID_STATUS, TaskCreate, TaskOut, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _can_see_task(db: Session, task: ActionItem, user: User) -> bool:
    if user.role in ("MANAGER", "ADMIN"):
        return True
    meeting = db.get(Meeting, task.meeting_id)
    if meeting and meeting.organizer_id == user.id:
        return True
    return task.assigned_to == user.id


def _serialize(db: Session, task: ActionItem) -> TaskOut:
    meeting = db.get(Meeting, task.meeting_id)
    overdue = bool(
        task.deadline and task.deadline < datetime.utcnow() and task.status != "COMPLETED"
    )
    return TaskOut(
        id=task.id, meeting_id=task.meeting_id,
        meeting_title=meeting.title if meeting else "",
        title=task.title, description=task.description or "",
        assigned_to=task.assigned_to,
        assignee_name=task.assignee.name if task.assignee else None,
        deadline=task.deadline, status=task.status, priority=task.priority,
        overdue=overdue,
    )


@router.get("", response_model=list[TaskOut])
def list_tasks(
    view: str = Query(default="all"),
    status_: str = Query(default="", alias="status"),
    priority: str = Query(default=""),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(ActionItem).options(selectinload(ActionItem.assignee))
    if user.role not in ("MANAGER", "ADMIN"):
        org_ids = [r[0] for r in db.query(Meeting.id).filter_by(organizer_id=user.id).all()]
        q = q.filter(or_(ActionItem.assigned_to == user.id, ActionItem.meeting_id.in_(org_ids or [-1])))
    view = view.lower()
    now = datetime.utcnow()
    if view == "mine":
        q = q.filter(ActionItem.assigned_to == user.id)
    elif view == "pending":
        q = q.filter(ActionItem.status.in_(["TODO", "IN_PROGRESS"]))
    elif view == "completed":
        q = q.filter(ActionItem.status == "COMPLETED")
    elif view == "overdue":
        q = q.filter(ActionItem.status != "COMPLETED", ActionItem.deadline.is_not(None), ActionItem.deadline < now)
    if status_:
        s = status_.upper()
        if s not in VALID_STATUS:
            raise HTTPException(status_code=400, detail="Invalid status filter.")
        q = q.filter(ActionItem.status == s)
    if priority:
        p = priority.upper()
        if p not in VALID_PRIORITY:
            raise HTTPException(status_code=400, detail="Invalid priority filter.")
        q = q.filter(ActionItem.priority == p)
    tasks = q.order_by(ActionItem.deadline.is_(None), ActionItem.deadline.asc()).all()
    return [_serialize(db, t) for t in tasks]


@router.post("", response_model=TaskOut, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    meeting = db.get(Meeting, payload.meeting_id)
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found.")
    if meeting.organizer_id != user.id and user.role not in ("MANAGER", "ADMIN"):
        raise HTTPException(status_code=403, detail="Only the organizer or a manager can add tasks.")
    assignee = None
    if payload.assigned_to is not None:
        assignee = db.get(User, payload.assigned_to)
        if assignee is None:
            raise HTTPException(status_code=400, detail="Assigned user does not exist.")
    task = ActionItem(
        meeting_id=meeting.id, title=payload.title.strip(),
        description=payload.description.strip(), assigned_to=assignee.id if assignee else None,
        deadline=payload.deadline, status="TODO", priority=payload.clean_priority(),
        ai_generated=False,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return _serialize(db, task)


@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    task = db.query(ActionItem).options(selectinload(ActionItem.assignee)).get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")
    if not _can_see_task(db, task, user):
        raise HTTPException(status_code=403, detail="You do not have access to this task.")
    if payload.title is not None:
        task.title = payload.title.strip()
    if payload.description is not None:
        task.description = payload.description.strip()
    if payload.assigned_to is not None:
        if payload.assigned_to == 0:
            task.assigned_to = None
        else:
            if db.get(User, payload.assigned_to) is None:
                raise HTTPException(status_code=400, detail="Assigned user does not exist.")
            task.assigned_to = payload.assigned_to
    if payload.deadline is not None:
        task.deadline = payload.deadline
    if payload.status is not None:
        s = payload.status.upper()
        if s not in VALID_STATUS:
            raise HTTPException(status_code=400, detail="Invalid status.")
        task.status = s
    if payload.priority is not None:
        p = payload.priority.upper()
        if p not in VALID_PRIORITY:
            raise HTTPException(status_code=400, detail="Invalid priority.")
        task.priority = p
    task.ai_generated = False  # human-touched results are no longer pure AI suggestions
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return _serialize(db, task)


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    task = db.get(ActionItem, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")
    meeting = db.get(Meeting, task.meeting_id)
    if (meeting is None or meeting.organizer_id != user.id) and user.role not in ("MANAGER", "ADMIN"):
        raise HTTPException(status_code=403, detail="Only the organizer or a manager can delete tasks.")
    db.delete(task)
    db.commit()
    return None
