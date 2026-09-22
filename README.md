# MeetingMind

**Enterprise Meeting Intelligence & Action Management Platform**

A full-stack enterprise productivity application that transforms meeting transcripts
into structured summaries, decisions, action items, and trackable tasks using AI.

> Not just "an AI meeting summarizer" — a complete workflow: meetings → transcripts →
> AI analysis → decisions → assigned tasks with deadlines → team dashboard → reports.

## Overview

Employees lose hours re-reading notes, remembering decisions, and chasing action items.
MeetingMind converts raw meeting content into structured, assignable, deadline-tracked
work with a team dashboard — built like a real enterprise SaaS product.

## Problem Statement

- Meeting knowledge lives in scattered notes and long transcripts.
- Decisions are forgotten; action items lack owners and deadlines.
- Follow-up depends on memory instead of a system.

## Solution

```
Meeting → Transcript/Notes → AI Processing → Summary → Decisions
→ Action Items → Assigned Employees → Deadlines → Task Tracking → Dashboard
```

## Features

- JWT authentication with EMPLOYEE / MANAGER / ADMIN roles
- Meeting CRUD with participants, search, status/date filtering, sorting
- Transcript paste + `.txt`/`.md` upload (validated type/size), audio-ready design
- AI analysis pipeline producing summary, decisions, action items, topics, follow-ups
- Strict Pydantic validation of structured AI JSON; graceful failure, never crashes
- AI results are editable suggestions, badged "AI-generated"
- Action items: assign, deadline, status (TODO/IN_PROGRESS/COMPLETED), priority
- Task views: All / Mine / Pending / Completed / Overdue
- Employee dashboard: meeting stats, task stats, upcoming deadlines, recent meetings,
  8-week activity chart
- Meeting detail intelligence view with processing status
  (NOT_PROCESSED → PROCESSING → PROCESSED / FAILED)
- Report export: JSON + printable HTML report
- Loading / empty / error / unauthorized / AI-failure states on every screen
- Backend: 22 pytest tests; frontend: vitest critical-path tests

## User Roles

| Role     | Capabilities                                              |
|----------|-----------------------------------------------------------|
| EMPLOYEE | Own meetings/tasks, participate, edit own content         |
| MANAGER  | All of the above, plus read/edit/delete any meeting/task  |
| ADMIN    | Same as manager (reserved for org-level controls)         |

## Architecture

```
React Frontend (Vite + Tailwind + Router + Axios)
       ↓  REST + JWT (Bearer)
FastAPI REST API
       ↓
Service Layer (routers → services → SQLAlchemy)
   ↙       ↘
PostgreSQL   AI Service (provider abstraction)
(SQLite fallback for local dev)
       ↓
Meeting / Task Data
```

Modular monolith — no microservices, no extra infrastructure for V1.

## Technology Stack

- Frontend: React 18, React Router 6, Tailwind CSS, Axios, Vitest
- Backend: Python, FastAPI, Pydantic v2, SQLAlchemy 2.0, PyJWT, httpx
- Database: PostgreSQL-compatible (SQLite file for local dev via `DATABASE_URL`)
- Auth: PBKDF2-HMAC-SHA256 password hashing (stdlib), JWT Bearer tokens
- AI: provider abstraction (`rules` offline default / `openai-compatible` LLM)

## Project Structure

```
.
├── src/                    # React frontend (Vite root)
│   ├── components/         # Layout, UI kit (cards, badges, states)
│   ├── pages/              # Login, Register, Dashboard, Meetings,
│   │                       # MeetingDetail, Tasks, Profile
│   ├── context/            # AuthContext (JWT session)
│   ├── services/           # Axios API client + interceptors
│   └── utils/              # Date/deadline helpers (+ tests)
├── backend/
│   └── app/
│       ├── main.py         # FastAPI app, CORS, lifespan, routers
│       ├── core/           # config, security (hash/JWT), deps
│       ├── models/         # User, Meeting, Participant, ActionItem, Decision, Topic
│       ├── schemas/        # Pydantic request/response contracts
│       ├── routers/        # auth, meetings, tasks, dashboard, export
│       ├── services/       # authorization helpers
│       ├── ai/             # provider.py, prompts.py, meeting_analyzer.py, schemas.py
│       └── database/       # engine/session (Postgres + SQLite)
│   └── tests/              # pytest suite (auth/meetings/tasks/ai)
├── .env.example
├── .gitignore
├── LICENSE (MIT)
└── README.md
```

## Database Design

- **users**: id, name, email (unique), password_hash, role, timestamps
- **meetings**: id, title, description, date, duration_minutes, organizer_id → users,
  transcript, summary, status, timestamps
- **meeting_participants**: id, meeting_id → meetings, user_id → users
- **action_items**: id, meeting_id → meetings, title, description,
  assigned_to → users (nullable), deadline (nullable), status, priority,
  ai_generated, timestamps
- **decisions**: id, meeting_id → meetings, description, ai_generated
- **topics**: id, meeting_id → meetings, name

Access rule: organizer, participant, or MANAGER/ADMIN.

## Authentication

1. `POST /api/auth/register` / `POST /api/auth/login` → `{access_token, user}`
2. Client stores token, sends `Authorization: Bearer <token>`
3. `GET /api/auth/me` restores the session; 401s redirect to `/login`
4. Passwords hashed with PBKDF2-HMAC-SHA256 (210k iterations, random salt);
   hashes never leave the server.

## AI Processing Pipeline

```
Transcript → provider.analyze() → raw JSON → strip fences
→ AIAnalysisResult (Pydantic) → sanitize → resolve assignees
→ replace prior AI artifacts → meeting.status = PROCESSED
```

- Providers: `RuleBasedProvider` (offline, deterministic, default) and
  `OpenAICompatibleProvider` (any OpenAI-compatible chat-completions endpoint).
- Malformed JSON / schema violations / provider errors → `status = FAILED`,
  HTTP 502 with a friendly message; nothing malformed is ever saved.
- Hallucination guardrails: prompt requires null for unknown people/dates;
  rules provider only assigns names matched by pattern; everything is editable.

## API Documentation

Interactive docs generated by FastAPI: `http://localhost:8000/docs`

Key routes:

```
GET    /api/health
POST   /api/auth/register   POST /api/auth/login   GET /api/auth/me
GET    /api/meetings  POST /api/meetings
GET    /api/meetings/{id}   PUT /api/meetings/{id}   DELETE /api/meetings/{id}
PUT    /api/meetings/{id}/transcript
POST   /api/meetings/{id}/upload
POST   /api/meetings/{id}/analyze
GET    /api/meetings/{id}/export.json   GET /api/meetings/{id}/report
GET    /api/tasks  POST /api/tasks
PUT    /api/tasks/{id}   DELETE /api/tasks/{id}
GET    /api/dashboard
```

## Frontend

Routes: `/login`, `/register`, `/dashboard`, `/meetings`, `/meetings/:id`,
`/tasks`, `/profile`. Protected routes redirect to login when unauthenticated.
Shared UI kit (`Card`, `Badge`, `AiTag`, `Spinner`, `EmptyState`, `ErrorBanner`)
keeps spacing/typography consistent; layout is responsive with a sidebar on desktop.

## Installation

Prerequisites: Python 3.11+, Node 18+.

```bash
# backend
cd backend
py -m pip install -r requirements.txt

# frontend (repo root)
npm install
```

## Environment Variables

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|----------|---------|---------|
| SECRET_KEY | (change me) | JWT signing key |
| ACCESS_TOKEN_EXPIRE_MINUTES | 720 | Token lifetime |
| DATABASE_URL | sqlite:///./meetingmind.db | Postgres URL for prod, e.g. `postgresql+psycopg2://user:pw@host:5432/meetingmind` |
| CORS_ORIGINS | http://localhost:5173 | Allowed frontend origins |
| AI_PROVIDER | rules | `rules` or `openai-compatible` |
| LLM_API_KEY | (empty) | LLM key — never commit |
| LLM_BASE_URL | https://openrouter.ai/api/v1 | OpenAI-compatible endpoint |
| LLM_MODEL | openai/gpt-4o-mini | Model name |
| MAX_UPLOAD_BYTES | 524288 | Transcript upload cap |

## Local Development

```bash
# terminal 1 — API on http://localhost:8000
cd backend
py -m uvicorn app.main:app --reload --port 8000

# terminal 2 — web on http://localhost:5173 (proxies /api → :8000)
npm run dev
```

Seed a demo: register at `/register`, create a meeting, paste a transcript,
click **Analyze with AI**, review the suggestions on the detail page.

## Testing

```bash
cd backend
py -m pytest tests -q        # 22 tests: auth, meetings, tasks, AI (mocked providers)

npm run test -- --run         # from repo root: 3 vitest tests (date/deadline utils)
```

No live AI key is required — AI tests use mocked/offline providers.

## Security

- Passwords hashed (PBKDF2-SHA256, unique salt); hashes never serialized
- JWT with expiry; secrets only via environment; `.env` is git-ignored
- Per-object authorization on every meeting/task access
- Transcript uploads: extension + MIME + 512 KB cap + UTF-8 enforcement
- Pydantic validation on all input; generic error messages (no stack traces)
- CORS restricted to configured origins

## AI Processing (disclaimer)

AI-generated summaries, decisions, action items, and topics are **suggestions**.
They are badged "AI-generated", fully editable, and must be reviewed by employees
before being treated as final. The system prefers leaving assignees/deadlines
blank over fabricating them.

## Screenshots

Run locally and capture `/dashboard`, `/meetings`, `/meetings/:id`, `/tasks`
for the project gallery (docs screenshots are not committed in V1).

## Future Improvements

Audio/video transcription, Teams/Meet/Slack integrations, email notifications,
calendar sync, cloud object storage, workspaces, advanced analytics, AI follow-ups,
enterprise SSO, audit logs, background jobs.

## Limitations

- Offline `rules` provider is heuristic — connect an LLM key for higher quality
- SQLite dev DB is single-node; use Postgres in production
- No real-time collaboration or background job queue in V1
- Reports are JSON/printable HTML (no native PDF renderer bundled)

## Development Milestones

Actual commit history (`git log --oneline`):

```
d385722 docs: complete project documentation
e49a948 feat: build React frontend shell, meetings, tasks and dashboard
cc04d48 test: add backend test coverage
5b30f70 feat: add AI meeting analysis pipeline
4857689 feat: implement meeting, task, dashboard and export APIs
0bc50db feat: implement authentication and role-based access
061dcb8 feat: add database models and schema
8749a0c feat: create FastAPI backend foundation
ee3c07c chore: initialize MeetingMind project
```

## License

MIT — see [LICENSE](LICENSE).

## Project Maintenance

Last automated maintenance update: 2026-09-22
