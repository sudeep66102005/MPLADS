from app.ai_engine.scoring import compute_delay_probability, compute_health_score, detect_anomalies
from app import mock_store


def test_compute_health_score_within_bounds():
    project = mock_store.list_projects()[0]
    score = compute_health_score(project)
    assert 0.0 <= score <= 100.0


def test_compute_delay_probability_within_bounds():
    project = mock_store.list_projects()[0]
    probability, days = compute_delay_probability(project)
    assert 0.0 <= probability <= 100.0
    assert days >= 0


def test_detect_anomalies_flags_expenditure_progress_mismatch():
    project = mock_store.list_projects()[0]  # financial 82%, physical 48% -> gap 34
    flags = detect_anomalies(project)
    assert any(f.factor == "Expenditure vs. Progress Mismatch" for f in flags)


def test_detect_anomalies_no_flags_for_healthy_project():
    healthy_project = {
        **mock_store.list_projects()[0],
        "financial_progress_pct": 60,
        "physical_progress_pct": 58,
        "update_consistency_pct": 90,
        "pending_approvals": 0,
    }
    flags = detect_anomalies(healthy_project)
    assert flags == []
