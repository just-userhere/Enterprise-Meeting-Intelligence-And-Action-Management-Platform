"""Meeting report export: JSON (machine-readable) and printable HTML.

Only users with meeting access may export; no extra data is leaked."""

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session, selectinload

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.action_item import ActionItem
from app.models.meeting import Meeting, MeetingParticipant
from app.models.user import User
from app.services.access import get_accessible_meeting
import html as _html

router = APIRouter(prefix="/api/meetings", tags=["export"])


def _load(db: Session, meeting_id: int) -> Meeting:
    return (
        db.query(Meeting)
        .options(
            selectinload(Meeting.organizer),
            selectinload(Meeting.participants).selectinload(MeetingParticipant.user),
            selectinload(Meeting.action_items).selectinload(ActionItem.assignee),
            selectinload(Meeting.decisions),
            selectinload(Meeting.topics),
        )
        .get(meeting_id)
    )


@router.get("/{meeting_id}/export.json")
def export_json(meeting_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_accessible_meeting(db, meeting_id, user)
    m = _load(db, meeting_id)
    return {
        "meeting": {"id": m.id, "title": m.title, "description": m.description,
                    "date": m.date, "duration_minutes": m.duration_minutes,
                    "status": m.status,
                    "organizer": m.organizer.name if m.organizer else None},
        "participants": [{"name": p.user.name, "email": p.user.email} for p in m.participants if p.user],
        "summary": m.summary,
        "decisions": [d.description for d in m.decisions],
        "topics": [t.name for t in m.topics],
        "action_items": [
            {"title": a.title, "description": a.description, "status": a.status,
             "priority": a.priority, "deadline": a.deadline,
             "assignee": a.assignee.name if a.assignee else None}
            for a in m.action_items
        ],
    }


@router.get("/{meeting_id}/report", response_class=HTMLResponse)
def export_report(meeting_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_accessible_meeting(db, meeting_id, user)
    m = _load(db, meeting_id)
    esc = _html.escape
    parts = "".join(f"<li>{esc(p.user.name)} &lt;{esc(p.user.email)}&gt;</li>" for p in m.participants if p.user)
    decs = "".join(f"<li>{esc(d.description)}</li>" for d in m.decisions) or "<li>No decisions recorded.</li>"
    topics = "".join(f"<li>{esc(t.name)}</li>" for t in m.topics) or "<li>No topics recorded.</li>"
    tasks = "".join(
        f"<li><strong>{esc(a.title)}</strong> — {esc(a.status)} / {esc(a.priority)}"
        + (f" — due {a.deadline}" if a.deadline else "")
        + (f" — {esc(a.assignee.name)}" if a.assignee else "") + "</li>"
        for a in m.action_items
    ) or "<li>No action items.</li>"
    return f"""<!doctype html><html><head><meta charset="utf-8">
<title>Meeting Report — {esc(m.title)}</title>
<style>body{{font-family:Arial,sans-serif;max-width:800px;margin:32px auto;padding:0 16px;color:#111}}
h1{{font-size:24px}}h2{{font-size:17px;margin-top:28px;border-bottom:1px solid #ddd;padding-bottom:4px}}
.meta{{color:#555;font-size:13px}}.ai{{font-size:12px;color:#666}}</style></head><body>
<h1>{esc(m.title)}</h1>
<p class="meta">{m.date} · {m.duration_minutes} min · Status: {esc(m.status)} · Organizer: {esc(m.organizer.name if m.organizer else "")}</p>
<p class="ai">AI-generated content — please review before treating it as final.</p>
<h2>Summary</h2><p>{esc(m.summary or "No summary yet.")}</p>
<h2>Participants</h2><ul>{parts or "<li>None listed.</li>"}</ul>
<h2>Key Decisions</h2><ul>{decs}</ul>
<h2>Topics</h2><ul>{topics}</ul>
<h2>Action Items</h2><ul>{tasks}</ul>
<script>window.print && 0;</script></body></html>"""
