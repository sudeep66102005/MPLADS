import io
from datetime import date, timedelta
from PIL import Image
from app.models import User, Project
from app.operational_models import AccessGrant, Evidence, AnalysisSnapshot
from app.services import analyze

def image_bytes(color="blue"):
    b = io.BytesIO()
    Image.new("RGB", (32, 32), color).save(b, format="PNG")
    return b.getvalue()

def test_health(client):
    assert client.get("/health").json()["version"] == "1.0.0"
    assert client.get("/ready").status_code == 200

def test_scope_covers_lists_details_reports_and_agencies(client, headers):
    h = headers("mp")
    assert client.get("/api/v1/projects", headers=h).json()["total"] == 1
    assert client.get("/api/v1/projects/2", headers=h).status_code == 404
    assert client.get("/api/v1/projects/2/timeline", headers=h).status_code == 404
    assert client.get("/api/v1/dashboard/kpis", headers=h).json()["totalProjects"] == 1
    csv = client.get("/api/v1/reports/export", headers=h).text
    assert "P-1" in csv and "P-2" not in csv
    assert client.get("/api/v1/agencies/1", headers=h).json()["projectsCount"] == 1
    assert client.get("/api/v1/constituencies/2/sector-gaps", headers=h).status_code == 404
    assert client.get("/api/v1/projects", params={"sort_by": "__dict__"}, headers=h).status_code == 422
    assert client.get("/api/v1/projects/not-a-number", headers=h).status_code == 422

def test_agency_requires_explicit_grant(client, headers, db):
    h = headers("agency")
    assert client.get("/api/v1/projects", headers=h).json()["total"] == 0
    u = db.query(User).filter_by(username="agency").one()
    db.add(AccessGrant(user_id=u.id, constituency_id=1, agency_id=1))
    db.commit()
    assert client.get("/api/v1/projects", headers=h).json()["total"] == 1
    assert client.patch("/api/v1/projects/1", json={"name": "Changed"}, headers=h).status_code == 403

def test_project_validation_scoring_and_delete(client, headers, db):
    h = headers()
    assert client.patch("/api/v1/projects/1", json={"physicalProgressPct": 101}, headers=h).status_code == 422
    assert client.patch("/api/v1/projects/1", json={"name": None}, headers=h).status_code == 422
    assert client.patch("/api/v1/projects/1", json={"expenditureCr": .9}, headers=h).status_code == 422
    r = client.patch("/api/v1/projects/1", json={"physicalProgressPct": 70}, headers=h)
    assert r.status_code == 200
    analysis = client.get("/api/v1/projects/1/ai-analysis", headers=h).json()
    assert analysis["delayProbabilityPct"] is None
    assert not any(x["factor"] == "Expenditure vs. Progress Mismatch" for x in analysis["explanations"])
    assert db.query(AnalysisSnapshot).filter_by(project_id=1).count() == 2
    assert client.delete("/api/v1/projects/1", headers=h).status_code == 204
    assert client.get("/api/v1/projects/1", headers=h).status_code == 404

def test_new_project_not_penalized_for_being_early(db):
    p = db.get(Project, 1)
    p.start_date = date.today()
    p.expected_end_date = date.today()+timedelta(days=100)
    p.physical_progress_pct = p.financial_progress_pct = 0
    result = analyze(p)
    assert result["aiHealthScore"] == 100
    assert result["explanations"] == []

def test_import_is_atomic_and_repeatable(client, headers):
    h = headers()
    template = client.get("/api/v1/imports/template", headers=h).text
    row = "NEW-1,New well,Water,1,1,23.4,77.4,In Progress,1,0.8,0.7,20,2026-01-01,2027-01-01\n"
    bad = "BAD,Bad well,Water,1,1,23.4,77.4,In Progress,1,0.2,0.9,20,2026-01-01,2027-01-01\n"
    def send(data):
        return client.post("/api/v1/imports/projects", files={"file": ("data.csv", data, "text/csv")}, headers=h)
    assert send(template+row+bad).status_code == 422
    assert client.get("/api/v1/projects", headers=h).json()["total"] == 2
    assert send(template+row).json() == {"created": 1, "updated": 0}
    assert send(template+row).json() == {"created": 0, "updated": 1}

def test_full_inspection_evidence_review_flow(client, headers, db):
    admin, officer = headers(), headers("officer")
    oid = db.query(User).filter_by(username="officer").one().id
    payload = {"projectId": 1, "inspectorId": oid, "inspectionDate": str(date.today()), "requestKey": "assignment-001"}
    assigned = client.post("/api/v1/inspections", json=payload, headers=admin)
    assert assigned.status_code == 201, assigned.text
    iid = assigned.json()["id"]
    assert client.post("/api/v1/inspections", json=payload, headers=admin).json()["id"] == iid
    assert client.get(f"/api/v1/inspections/{iid}", headers=headers("otherofficer")).status_code == 404
    raw = image_bytes()
    def upload(key, content=raw):
        return client.post("/api/v1/projects/1/photos", files={"file": ("site.png", content, "image/png")},
                           data={"request_key": key, "caption": "Site evidence", "lat": 23.4, "lng": 77.4}, headers=officer)
    evidence = upload("upload-key-001")
    assert evidence.status_code == 201, evidence.text
    eid = evidence.json()["id"]
    assert upload("upload-key-001").json()["id"] == eid
    assert upload("upload-key-001", image_bytes("red")).status_code == 409
    second = upload("upload-key-002").json()
    assert second["duplicateCandidates"][0]["exact"] is True
    assert client.get(f"/api/v1/evidence/{eid}/file").status_code == 401
    assert client.get(f"/api/v1/evidence/{eid}/file", headers=officer).content == raw
    assert client.get(f"/api/v1/evidence/{eid}/file", headers=headers("otherofficer")).status_code == 404
    body = {"version": 1, "findings": "Site visited; reported progress checked.", "physicalProgressObservedPct": 25, "evidenceIds": [eid]}
    saved = client.patch(f"/api/v1/inspections/{iid}", json=body, headers=officer)
    assert saved.status_code == 200, saved.text
    assert client.patch(f"/api/v1/inspections/{iid}", json=body, headers=officer).status_code == 409
    body["version"] = 2
    submitted = client.post(f"/api/v1/inspections/{iid}/submit", json=body, headers=officer)
    assert submitted.json()["status"] == "Submitted"
    review = {"version": 3, "decision": "Closed", "outcome": "Issue confirmed", "note": "Evidence reviewed and follow-up recorded."}
    assert client.post(f"/api/v1/inspections/{iid}/review", json=review, headers=officer).status_code == 403
    assert client.post(f"/api/v1/inspections/{iid}/review", json=review, headers=admin).json()["status"] == "Closed"
    actions = [e["action"] for e in client.get("/api/v1/audit?project_id=1", headers=admin).json()]
    assert "inspection.reviewed" in actions and "evidence.uploaded" in actions

def test_reject_invalid_image_and_foreign_evidence(client, headers):
    h = headers()
    r = client.post("/api/v1/projects/1/photos", files={"file": ("fake.png", b"not an image", "image/png")},
                    data={"request_key": "invalid-image"}, headers=h)
    assert r.status_code == 422

def test_gap_requires_provenance(client, headers):
    h = headers()
    assert client.get("/api/v1/constituencies/1/sector-gaps", headers=h).json() == []
    payload = {"sector": "Water", "need": 100, "covered": 60, "source": "Pilot household survey", "asOf": str(date.today())}
    assert client.post("/api/v1/constituencies/1/sector-gaps", json=payload, headers=h).json()["gapPct"] == 40
    assert client.get("/api/v1/constituencies/1/sector-gaps", headers=headers("mp")).json()[0]["source"] == payload["source"]
