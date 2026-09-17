from tests.conftest import auth_headers, register


def _setup(client):
    org = register(client, name="Org", email="org@corp.com", role="EMPLOYEE")
    emp = register(client, name="Emp", email="emp@corp.com", role="EMPLOYEE")
    org_h, emp_h = auth_headers(org["access_token"]), auth_headers(emp["access_token"])
    mid = client.post("/api/meetings", json={"title": "Task Meeting", "participant_ids": [emp["user"]["id"]]}, headers=org_h).json()["id"]
    return org, emp, org_h, emp_h, mid


def test_task_lifecycle(client):
    org, emp, org_h, emp_h, mid = _setup(client)
    r = client.post("/api/tasks", json={"meeting_id": mid, "title": "Prepare slides", "assigned_to": emp["user"]["id"], "priority": "HIGH"}, headers=org_h)
    assert r.status_code == 201, r.text
    tid = r.json()["id"]

    # assignee can view + update status
    r = client.get("/api/tasks?view=mine", headers=emp_h)
    assert any(t["id"] == tid for t in r.json())
    r = client.put(f"/api/tasks/{tid}", json={"status": "IN_PROGRESS"}, headers=emp_h)
    assert r.json()["status"] == "IN_PROGRESS"
    r = client.put(f"/api/tasks/{tid}", json={"status": "COMPLETED"}, headers=emp_h)
    assert r.json()["status"] == "COMPLETED"

    # invalid status rejected
    assert client.put(f"/api/tasks/{tid}", json={"status": "DONE"}, headers=emp_h).status_code == 400


def test_task_views_and_overdue(client):
    org, emp, org_h, emp_h, mid = _setup(client)
    client.post("/api/tasks", json={"meeting_id": mid, "title": "Past due task", "assigned_to": emp["user"]["id"], "deadline": "2020-01-01T00:00:00"}, headers=org_h)
    r = client.get("/api/tasks?view=overdue", headers=emp_h)
    assert r.status_code == 200
    assert len(r.json()) >= 1
    assert r.json()[0]["overdue"] is True


def test_task_authz(client):
    org, emp, org_h, emp_h, mid = _setup(client)
    stranger = register(client, name="Str", email="str@corp.com")
    str_h = auth_headers(stranger["access_token"])
    tid = client.post("/api/tasks", json={"meeting_id": mid, "title": "Secret task"}, headers=org_h).json()["id"]
    assert client.put(f"/api/tasks/{tid}", json={"status": "COMPLETED"}, headers=str_h).status_code == 403


def test_dashboard(client):
    org, emp, org_h, emp_h, mid = _setup(client)
    r = client.get("/api/dashboard", headers=emp_h)
    assert r.status_code == 200
    body = r.json()
    assert {"meetings", "tasks", "upcoming_deadlines", "recent_meetings", "meetings_per_week"} <= set(body.keys())


def test_export(client):
    org, emp, org_h, emp_h, mid = _setup(client)
    r = client.get(f"/api/meetings/{mid}/export.json", headers=emp_h)
    assert r.status_code == 200
    assert "action_items" in r.json()
    r = client.get(f"/api/meetings/{mid}/report", headers=emp_h)
    assert r.status_code == 200
    assert "Meeting" in r.text or "Task Meeting" in r.text
