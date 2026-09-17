"""Isolated test DB (file-backed SQLite) + TestClient with auth helpers."""

import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_meetingmind.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("AI_PROVIDER", "rules")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.session import Base, get_db
import app.models  # noqa: F401
from app.main import app

TEST_DB = "./test_meetingmind.db"
if os.path.exists(TEST_DB):
    os.remove(TEST_DB)

engine = create_engine("sqlite:///./test_meetingmind.db", connect_args={"check_same_thread": False})
TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base.metadata.create_all(bind=engine)


def _override_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_db


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c


def register(client, name="Alice", email="alice@corp.com", password="Password123", role="EMPLOYEE"):
    r = client.post("/api/auth/register", json={"name": name, "email": email, "password": password, "role": role})
    assert r.status_code == 201, r.text
    return r.json()


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
