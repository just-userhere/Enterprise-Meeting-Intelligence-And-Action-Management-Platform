"""MeetingMind API — modular monolith: FastAPI -> services -> Postgres/SQLite + AI service."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.database.session import Base, engine

# Import models so metadata is registered before create_all
import app.models  # noqa: F401
from app.routers import auth, dashboard, export, meetings, tasks

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="MeetingMind API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(meetings.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)
app.include_router(export.router)


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.get("/api/config")
def public_config():
    s = get_settings()
    return {"ai_provider": ("rules" if not s.LLM_API_KEY else s.AI_PROVIDER)}
