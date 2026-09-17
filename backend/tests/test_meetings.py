from tests.conftest import auth_headers, register


def _user(client, email="bob@corp.com", role="EMPLOYEE"):
    reg = register(client, name=email.split("@")[0].title(), email=email, role=role)
    return reg["user"], auth_headers(reg["access_token"])


def test_meeting_crud(client):
    _, h = _user(client)
    r = client.post("/api/meetings", json={"title": "Sprint Planning", "description": "Plan Q3"}, headers=h)
    assert r.status_code == 201, r.text
    mid = r.json()["id"]

    r = client.get(f"/api/meetings/{mid}", headers=h)
    assert r.status_code == 200
    assert r.json()["title"] == "Sprint Planning"

    r = client.put(f"/api/meetings/{mid}", json={"title": "Sprint Planning v2"}, headers=h)
    assert r.status_code == 200
    assert r.json()["title"] == "Sprint Planning v2"

    r = client.delete(f"/api/meetings/{mid}", headers=h)
    assert r.status_code == 204
    assert client.get(f"/api/meetings/{mid}", headers=h).status_code == 404


def test_meeting_authorization(client):
    _, org_h = _user(client, "org@corp.com")
    _, outsider_h = _user(client, "outsider@corp.com")
    r = client.post("/api/meetings", json={"title": "Private Sync"}, headers=org_h)
    mid = r.json()["id"]
    # outsider (employee, not participant) cannot read
    assert client.get(f"/api/meetings/{mid}", headers=outsider_h).status_code == 403
    # manager can read anything
    _, mgr_h = _user(client, "mgr@corp.com", role="MANAGER")
    assert client.get(f"/api/meetings/{mid}", headers=mgr_h).status_code == 200


def test_search_and_filter(client):
    _, h = _user(client)
    client.post("/api/meetings", json={"title": "Alpha Review"}, headers=h)
    client.post("/api/meetings", json={"title": "Beta Launch"}, headers=h)
    r = client.get("/api/meetings?search=alpha", headers=h)
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["title"] == "Alpha Review"


def test_transcript_and_analysis(client):
    _, h = _user(client)
    mid = client.post("/api/meetings", json={"title": "Weekly Sync"}, headers=h).json()["id"]
    text = ("We decided to launch the beta on Friday. "
            "Priya will prepare the release notes. Action: David to fix the login bug ASAP. "
            "We discussed the Q3 roadmap and pricing update.")
    r = client.put(f"/api/meetings/{mid}/transcript", json={"transcript": text}, headers=h)
    assert r.status_code == 200
    r = client.post(f"/api/meetings/{mid}/analyze", headers=h)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["status"] == "PROCESSED"
    assert len(body["summary"]) > 10
    assert isinstance(body["decisions"], list)
    assert isinstance(body["action_items"], list)


def test_analyze_requires_transcript(client):
    _, h = _user(client)
    mid = client.post("/api/meetings", json={"title": "Empty Meeting"}, headers=h).json()["id"]
    assert client.post(f"/api/meetings/{mid}/analyze", headers=h).status_code == 400


def test_upload_validation(client):
    _, h = _user(client)
    mid = client.post("/api/meetings", json={"title": "Upload Test"}, headers=h).json()["id"]
    r = client.post(f"/api/meetings/{mid}/upload", files={"file": ("evil.exe", b"data", "application/octet-stream")}, headers=h)
    assert r.status_code == 400
    r = client.post(f"/api/meetings/{mid}/upload", files={"file": ("notes.txt", b"short", "text/plain")}, headers=h)
    assert r.status_code == 400  # too short / empty
    r = client.post(f"/api/meetings/{mid}/upload", files={"file": ("notes.txt", b"This is a valid transcript with enough content for processing.", "text/plain")}, headers=h)
    assert r.status_code == 200
