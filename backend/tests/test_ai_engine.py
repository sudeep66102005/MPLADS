"""AI engine scoring tests."""

from app.ai_engine.scoring import (
    compute_delay_probability,
    compute_health_score,
    detect_anomalies,
    analyze_project,
)


_SAMPLE_PROJECT = {
    "id": "1",
    "physical_progress_pct": 48,
    "financial_progress_pct": 82,
    "timeline_adherence_pct": 40,
    "update_consistency_pct": 50,
    "pending_approvals": 3,
}


def test_compute_health_score_within_bounds():
    score = compute_health_score(_SAMPLE_PROJECT)
    assert 0.0 <= score <= 100.0


def test_compute_delay_probability_within_bounds():
    probability, days = compute_delay_probability(_SAMPLE_PROJECT)
    assert 0.0 <= probability <= 100.0
    assert days >= 0


def test_detect_anomalies_flags_expenditure_progress_mismatch():
    flags = detect_anomalies(_SAMPLE_PROJECT)
    assert any(f.factor == "Expenditure vs. Progress Mismatch" for f in flags)


def test_detect_anomalies_flags_pending_approvals():
    flags = detect_anomalies(_SAMPLE_PROJECT)
    assert any(f.factor == "Multiple Pending Approvals" for f in flags)


def test_detect_anomalies_no_flags_for_healthy_project():
    healthy = {
        **_SAMPLE_PROJECT,
        "financial_progress_pct": 60,
        "physical_progress_pct": 58,
        "update_consistency_pct": 90,
        "pending_approvals": 0,
    }
    flags = detect_anomalies(healthy)
    assert flags == []


def test_analyze_project_returns_full_analysis():
    analysis = analyze_project(_SAMPLE_PROJECT)
    assert analysis.project_id == "1"
    assert 0 <= analysis.ai_health_score <= 100
    assert 0 <= analysis.delay_probability_pct <= 100
    assert analysis.predicted_delay_days >= 0
    assert isinstance(analysis.explanations, list)


def test_health_score_improves_with_better_metrics():
    poor = compute_health_score(_SAMPLE_PROJECT)
    good = compute_health_score({
        **_SAMPLE_PROJECT,
        "physical_progress_pct": 90,
        "timeline_adherence_pct": 95,
        "update_consistency_pct": 95,
        "pending_approvals": 0,
    })
    assert good > poor

def test_rescoring_preserves_source_timestamp(db):
    from app.models import Project
    from app.services import score
    from datetime import datetime, timedelta
    p = db.get(Project,1)
    previous = datetime.now()-timedelta(days=60)
    p.updated_at = previous
    db.commit()
    score(db,p); db.commit(); db.refresh(p)
    assert p.updated_at == previous
    assert any(e["factor"] == "Stale source record" for e in analyze_project_rules(p)["explanations"])

def analyze_project_rules(p):
    from app.services import analyze
    return analyze(p)

def test_safe_model_inference_and_invalid_fallback(db, tmp_path, monkeypatch):
    import json
    from app.core.config import settings
    from app.models import Project
    from app.ai_engine.delay_model import FEATURES
    artifact = {"format":"mplads-linear-delay-v1","features":FEATURES,"mean":[0]*6,"scale":[1]*6,
                "classifier":{"coef":[0]*6,"intercept":0},"regressor":{"coef":[0]*6,"intercept":10},
                "version":"test","dataKind":"synthetic","source":"test only","evaluation":{"holdoutProjects":10}}
    path=tmp_path/"model.json"; path.write_text(json.dumps(artifact))
    monkeypatch.setattr(settings,"DELAY_MODEL_PATH",str(path))
    result=analyze_project_rules(db.get(Project,1))
    assert result["delayProbabilityPct"] == 50 and result["predictedDelayDays"] == 10
    monkeypatch.setattr(settings,"ENVIRONMENT","production")
    result=analyze_project_rules(db.get(Project,1))
    assert result["delayProbabilityPct"] is None
    assert "unavailable" in result["delayModelStatus"]

