"""
AI Engine — scoring service.

This module is the entry point for the "AI Engine (ML + Vision)" box in the
system architecture. It implements:

  1. AI Project Health Score   — 0-100 composite score
  2. AI Delay Prediction       — probability + expected days of delay
  3. Automatic Anomaly Detection — rule-based flags
  4. Batch rescoring           — score all projects and persist history

For the hackathon/demo scope, all scoring uses transparent, rule-based
baselines — deliberately simple and fully explainable. Swap in trained
ML models behind the same function signatures once labeled data is
available; the explanation contract stays the same.
"""

from __future__ import annotations

from app.schemas import AiExplanation, ProjectAiAnalysis, RiskLevel


def compute_health_score(project: dict) -> float:
    """Composite 0-100 health score. Higher = healthier project.

    Weighted average of physical progress, timeline adherence and update
    consistency; penalized by pending approvals.
    """
    physical = project["physical_progress_pct"]
    timeline = project["timeline_adherence_pct"]
    updates = project["update_consistency_pct"]
    approvals_penalty = min(project["pending_approvals"] * 5, 20)

    score = (0.4 * physical) + (0.3 * timeline) + (0.3 * updates) - approvals_penalty
    return round(max(0.0, min(100.0, score)), 1)


def compute_delay_probability(project: dict) -> tuple[float, int]:
    """Returns (delay_probability_pct, predicted_delay_days).

    Baseline heuristic: the gap between financial and physical progress,
    combined with timeline adherence, drives delay probability.
    """
    progress_gap = max(0, project["financial_progress_pct"] - project["physical_progress_pct"])
    timeline_shortfall = max(0, 100 - project["timeline_adherence_pct"])

    probability = min(100.0, (0.6 * progress_gap) + (0.4 * timeline_shortfall) * 0.5)
    predicted_days = int(round(progress_gap * 1.5 + timeline_shortfall * 0.8))
    return round(probability, 1), predicted_days


def detect_anomalies(project: dict) -> list[AiExplanation]:
    """Rule-based anomaly flags — the "Automatic Anomaly Detection" feature.

    Each rule is intentionally simple and stated in plain language so a
    human reviewer can immediately see *why* something was flagged.
    """
    flags: list[AiExplanation] = []

    progress_gap = project["financial_progress_pct"] - project["physical_progress_pct"]
    if progress_gap > 25:
        flags.append(
            AiExplanation(
                factor="Expenditure vs. Progress Mismatch",
                detail=(
                    f"{project['financial_progress_pct']}% of funds spent but only "
                    f"{project['physical_progress_pct']}% physical progress reported."
                ),
                severity=RiskLevel.high,
            )
        )

    if project["update_consistency_pct"] < 45:
        flags.append(
            AiExplanation(
                factor="Long Period Without Updates",
                detail="This project has not had a consistent field update recently.",
                severity=RiskLevel.medium,
            )
        )

    if project["pending_approvals"] >= 3:
        flags.append(
            AiExplanation(
                factor="Multiple Pending Approvals",
                detail=f"{project['pending_approvals']} approvals are pending, which may stall completion.",
                severity=RiskLevel.medium,
            )
        )

    return flags


def analyze_project(project: dict) -> ProjectAiAnalysis:
    """Full AI analysis bundle for a single project (dict-based, for
    backward compatibility with tests and the mock_store flow)."""
    health_score = compute_health_score(project)
    delay_probability, predicted_days = compute_delay_probability(project)
    explanations = detect_anomalies(project)

    return ProjectAiAnalysis(
        project_id=project["id"],
        ai_health_score=health_score,
        delay_probability_pct=delay_probability,
        predicted_delay_days=predicted_days,
        verified_progress_pct=None,
        explanations=explanations,
    )


def analyze_project_from_model(project) -> ProjectAiAnalysis:
    """Full AI analysis bundle for a SQLAlchemy Project model instance."""
    project_dict = {
        "id": str(project.id),
        "physical_progress_pct": project.physical_progress_pct,
        "financial_progress_pct": project.financial_progress_pct,
        "timeline_adherence_pct": project.timeline_adherence_pct,
        "update_consistency_pct": project.update_consistency_pct,
        "pending_approvals": project.pending_approvals,
    }

    health_score = compute_health_score(project_dict)
    delay_probability, predicted_days = compute_delay_probability(project_dict)
    explanations = detect_anomalies(project_dict)

    return ProjectAiAnalysis(
        project_id=str(project.id),
        ai_health_score=health_score,
        delay_probability_pct=delay_probability,
        predicted_delay_days=predicted_days,
        verified_progress_pct=None,
        explanations=explanations,
    )


def score_all_projects(db_session) -> int:
    """Batch re-score all projects and persist updated AI scores.

    Returns the number of projects scored. Called by the scheduled
    scoring job or the /rescore-all endpoint.
    """
    from app.models import AiScoreHistory, Project

    projects = db_session.query(Project).filter(Project.is_deleted == False).all()  # noqa: E712
    count = 0

    for project in projects:
        analysis = analyze_project_from_model(project)

        # Update the project's cached AI scores
        project.ai_health_score = analysis.ai_health_score
        project.delay_probability_pct = analysis.delay_probability_pct
        project.predicted_delay_days = analysis.predicted_delay_days
        project.ai_score = round(100 - analysis.ai_health_score, 1)  # invert for risk ranking

        # Persist score history for audit trail
        history = AiScoreHistory(
            project_id=project.id,
            ai_health_score=analysis.ai_health_score,
            delay_probability_pct=analysis.delay_probability_pct,
            predicted_delay_days=analysis.predicted_delay_days,
        )
        db_session.add(history)
        count += 1

    db_session.commit()
    return count
