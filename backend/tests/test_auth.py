"""Auth endpoint tests."""


def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "testmp", "password": "test123"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "accessToken" in body  # camelCase
    assert body["role"] == "MP"
    assert body["displayName"] == "Test MP"


def test_login_wrong_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "testmp", "password": "wrongpass"},
    )
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "nobody", "password": "test123"},
    )
    assert response.status_code == 401


def test_me_endpoint(client):
    # Login first
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"username": "testmp", "password": "test123"},
    )
    token = login_resp.json()["accessToken"]

    # Get profile
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["username"] == "testmp"
    assert body["role"] == "MP"


def test_me_without_token(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_refresh_token(client):
    # Login first
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"username": "testmp", "password": "test123"},
    )
    token = login_resp.json()["accessToken"]

    # Refresh
    response = client.post(
        "/api/v1/auth/refresh",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "accessToken" in body
    assert body["accessToken"] != token  # new token issued
