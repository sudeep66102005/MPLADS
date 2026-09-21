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

def test_deactivated_account_loses_existing_session(client, headers, db):
    from app.models import User
    h = headers("mp")
    uid = db.query(User).filter_by(username="mp").one().id
    assert client.patch(f"/api/v1/users/{uid}", json={"isActive": False}, headers=headers()).status_code == 200
    assert client.get("/api/v1/projects", headers=h).status_code == 401
    assert client.post("/api/v1/auth/login", json={"username":"mp","password":"test-password"}).status_code == 401

def test_admin_self_deactivation_rejected(client, headers, db):
    from app.models import User
    uid = db.query(User).filter_by(username="admin").one().id
    assert client.patch(f"/api/v1/users/{uid}", json={"isActive": False}, headers=headers()).status_code == 409

def test_grant_revoke_takes_effect_with_existing_token(client, headers, db):
    from app.models import User
    h = headers("agency")
    uid = db.query(User).filter_by(username="agency").one().id
    admin = headers()
    assert client.post(f"/api/v1/users/{uid}/grants", json={"constituencyId":1,"agencyId":1}, headers=admin).status_code == 201
    assert client.get("/api/v1/projects", headers=h).json()["total"] == 1
    gid = client.get(f"/api/v1/users/{uid}/grants", headers=admin).json()["additional"][0]["id"]
    assert client.delete(f"/api/v1/users/{uid}/grants/{gid}", headers=admin).status_code == 204
    assert client.get("/api/v1/projects/1", headers=h).status_code == 404

def test_expired_and_invalid_tokens(client):
    from app.core.security import create_access_token
    from datetime import timedelta
    expired = create_access_token({"sub":"admin"}, expires_delta=timedelta(seconds=-1))
    for token in [expired, "not.a.token"]:
        assert client.get("/api/v1/projects", headers={"Authorization":"Bearer "+token}).status_code == 401

def test_cors_allows_configured_origin_only(client):
    allowed = client.options("/api/v1/projects", headers={"Origin":"http://localhost:3000","Access-Control-Request-Method":"GET"})
    assert allowed.headers["access-control-allow-origin"] == "http://localhost:3000"
    rejected = client.options("/api/v1/projects", headers={"Origin":"https://untrusted.example","Access-Control-Request-Method":"GET"})
    assert "access-control-allow-origin" not in rejected.headers

