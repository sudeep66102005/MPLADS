"""API endpoint tests."""


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["version"] == "0.2.0"


def test_list_projects(client):
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    body = response.json()
    assert "items" in body
    assert "total" in body
    assert body["total"] >= 1
    assert "aiScore" in body["items"][0]  # camelCase


def test_list_all_projects(client):
    response = client.get("/api/v1/projects/all")
    assert response.status_code == 200
    body = response.json()
    assert len(body) >= 1


def test_get_project(client):
    response = client.get("/api/v1/projects/1")
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == "1"
    assert body["code"] == "MPLADS/2023/001"


def test_get_project_not_found(client):
    response = client.get("/api/v1/projects/9999")
    assert response.status_code == 404


def test_get_project_ai_analysis(client):
    response = client.get("/api/v1/projects/1/ai-analysis")
    assert response.status_code == 200
    body = response.json()
    assert body["projectId"] == "1"  # camelCase
    assert "explanations" in body
    assert "aiHealthScore" in body


def test_priority_queue_sorted_descending(client):
    response = client.get("/api/v1/projects/priority-queue")
    assert response.status_code == 200
    body = response.json()
    scores = [p["aiScore"] for p in body]
    assert scores == sorted(scores, reverse=True)


def test_list_agencies(client):
    response = client.get("/api/v1/agencies")
    assert response.status_code == 200
    body = response.json()
    assert len(body) >= 1
    assert "aiScore" in body[0]  # camelCase


def test_get_agency(client):
    response = client.get("/api/v1/agencies/1")
    assert response.status_code == 200
    assert response.json()["name"] == "Rural Development Dept."


def test_get_agency_not_found(client):
    response = client.get("/api/v1/agencies/9999")
    assert response.status_code == 404


def test_list_constituencies(client):
    response = client.get("/api/v1/constituencies")
    assert response.status_code == 200
    body = response.json()
    assert len(body) >= 1


def test_get_constituency(client):
    response = client.get("/api/v1/constituencies/1")
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Berasia, Bhopal MP"


def test_get_sector_gaps(client):
    response = client.get("/api/v1/constituencies/1/sector-gaps")
    assert response.status_code == 200
    body = response.json()
    assert len(body) >= 1
    assert "gapPct" in body[0]  # camelCase


def test_get_ward_gaps(client):
    response = client.get("/api/v1/constituencies/1/ward-gaps")
    assert response.status_code == 200
    body = response.json()
    assert len(body) >= 1


def test_dashboard_kpis(client):
    response = client.get("/api/v1/dashboard/kpis")
    assert response.status_code == 200
    body = response.json()
    assert "totalProjects" in body  # camelCase
    assert body["totalProjects"] >= 1


def test_dashboard_sector_distribution(client):
    response = client.get("/api/v1/dashboard/sector-distribution")
    assert response.status_code == 200
    body = response.json()
    assert len(body) >= 1


def test_dashboard_ai_insights(client):
    response = client.get("/api/v1/dashboard/ai-insights")
    assert response.status_code == 200
    body = response.json()
    assert len(body) >= 1


def test_project_radar(client):
    response = client.get("/api/v1/projects/1/radar")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 6


def test_reports_fund_utilization(client):
    response = client.get("/api/v1/reports/fund-utilization")
    assert response.status_code == 200
    body = response.json()
    assert "totalSanctionedCr" in body  # camelCase


def test_reports_project_status(client):
    response = client.get("/api/v1/reports/project-status")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 1


def test_reports_csv_export(client):
    response = client.get("/api/v1/reports/export")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
