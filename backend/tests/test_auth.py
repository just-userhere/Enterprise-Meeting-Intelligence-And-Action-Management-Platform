from tests.conftest import auth_headers, register


def test_register_login_me(client):
    reg = register(client)
    token = reg["access_token"]
    assert reg["user"]["email"] == "alice@corp.com"
    assert "password" not in str(reg).lower() or "password_hash" not in str(reg)

    # me
    r = client.get("/api/auth/me", headers=auth_headers(token))
    assert r.status_code == 200
    assert r.json()["name"] == "Alice"

    # login
    r = client.post("/api/auth/login", json={"email": "alice@corp.com", "password": "Password123"})
    assert r.status_code == 200
    assert r.json()["access_token"]


def test_duplicate_registration_rejected(client):
    register(client)
    r = client.post("/api/auth/register", json={"name": "A2", "email": "alice@corp.com", "password": "Password123"})
    assert r.status_code == 400


def test_invalid_login_rejected(client):
    register(client)
    r = client.post("/api/auth/login", json={"email": "alice@corp.com", "password": "wrongpass1"})
    assert r.status_code == 401


def test_protected_route_requires_token(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 401
    r = client.get("/api/meetings")
    assert r.status_code == 401


def test_password_never_returned(client):
    reg = register(client)
    assert "password_hash" not in reg["user"]
    r = client.get("/api/auth/me", headers=auth_headers(reg["access_token"]))
    assert "password_hash" not in r.json()
