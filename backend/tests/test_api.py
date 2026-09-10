from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_list_projects():
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    body = response.json()
    assert len(body) >= 1
    assert "ai_score" in body[0]


def test_get_project_not_found():
    response = client.get("/api/v1/projects/does-not-exist")
    assert response.status_code == 404


def test_get_project_ai_analysis():
    response = client.get("/api/v1/projects/1/ai-analysis")
    assert response.status_code == 200
    body = response.json()
    assert body["project_id"] == "1"
    assert "explanations" in body


def test_priority_queue_sorted_descending():
    response = client.get("/api/v1/projects/priority-queue")
    assert response.status_code == 200
    scores = [p["ai_score"] for p in response.json()]
    assert scores == sorted(scores, reverse=True)


def test_list_agencies():
    response = client.get("/api/v1/agencies")
    assert response.status_code == 200
    assert len(response.json()) >= 1
