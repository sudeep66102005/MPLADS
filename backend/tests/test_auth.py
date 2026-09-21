def test_login_logout_and_refresh(client, headers):
    h = headers("mp")
    assert client.get("/api/v1/auth/me", headers=h).json()["username"] == "mp"
    r = client.post("/api/v1/auth/refresh", headers=h)
    assert r.status_code == 200
    assert client.get("/api/v1/auth/me", headers=h).status_code == 401
    new = {"Authorization": "Bearer " + r.json()["accessToken"]}
    assert client.post("/api/v1/auth/logout", headers=new).status_code == 204
    assert client.get("/api/v1/auth/me", headers=new).status_code == 401

def test_protected_routes(client):
    for path in ["/projects", "/projects/1", "/agencies", "/dashboard/kpis", "/reports/export", "/inspections", "/audit"]:
        assert client.get("/api/v1" + path).status_code == 401

def test_login_rate_limit(client):
    for _ in range(10):
        assert client.post("/api/v1/auth/login", json={"username": "missing", "password": "wrong"}).status_code == 401
    assert client.post("/api/v1/auth/login", json={"username": "missing", "password": "wrong"}).status_code == 429

def test_registration_requires_admin(client, headers):
    payload = {"username": "new-user", "password": "long-password", "displayName": "New User", "role": "MP", "constituencyId": 1}
    assert client.post("/api/v1/auth/register", json=payload, headers=headers("mp")).status_code == 403
    assert client.post("/api/v1/auth/register", json=payload, headers=headers()).status_code == 201
    assert client.post("/api/v1/auth/register", json=payload, headers=headers()).status_code == 409
