"""
AI Engine — scoring service (skeleton).

This module is the entry point for the "AI Engine (ML + Vision)" box in the
system architecture. In the target system this would host / call out to:

  1. AI Project Health Score   — 0-100 composite score from physical/financial
                                   progress, timeline adherence, pending
                                   approvals, expenditure pattern, update cadence.
  2. AI Delay Prediction        — probability + expected number of days a
                                   project will slip past its deadline.
  3. AI Progress & Photo Verification — computer-vision checks on uploaded
                                   photos (duplicate/unrelated image
                                   detection, cross-stage comparison,
                                   location-metadata consistency).
  4. Automatic Anomaly Detection — statistical / rule-based flags on
                                   financial and progress time series
                                   (spend spikes, stalled projects, sudden
                                   progress claims, long silences).
  5. Agency Performance Score   — roll-up of per-project stats into a
                                   single agency accountability score.
  6. Constituency Development Gap Analysis — need vs. coverage per
                                   sector/ward, blending MPLADS project data
                                   with demographic/infrastructure baselines.

For the hackathon/demo scope, this module implements (1), (2) and (4) as
transparent, rule-based / lightweight-statistical baselines — deliberately
simple and fully explainable, in line with the "explainable AI, not a
black box" requirement from the SIH26102 problem statement. Swap in a
trained scikit-learn/gradient-boosting model behind the same function
signatures once labeled historical data (verified delays, verified
anomalies) is available; the explanation-generation contract
(`AiExplanation`) should stay the same so the frontend does not need to
change.
"""

from __future__ import annotations

from app.schemas import AiExplanation, ProjectAiAnalysis, RiskLevel


def compute_health_score(project: dict) -> float:
    """Composite 0-100 health score. Higher = healthier project.

    Weighted average of physical progress, financial progress consistency,
    timeline adherence and update consistency; penalized by pending
    approvals. This mirrors the "AI Project Health Score" feature.
    """
    physical = project["physical_progress_pct"]
    timeline = project["timeline_adherence_pct"]
    updates = project["update_consistency_pct"]
    approvals_penalty = min(project["pending_approvals"] * 5, 20)

    score = (0.4 * physical) + (0.3 * timeline) + (0.3 * updates) - approvals_penalty
    return round(max(0.0, min(100.0, score)), 1)


def compute_delay_probability(project: dict) -> tuple[float, int]:
    """Returns (delay_probability_pct, predicted_delay_days).

    Baseline heuristic: the gap between financial progress and physical
    progress, combined with timeline adherence, drives delay probability.
    A large mismatch (money spent without matching physical progress) is
    treated as the single strongest delay signal, echoing the "AI Delay
    Prediction" feature description.
    """
    progress_gap = max(0, project["financial_progress_pct"] - project["physical_progress_pct"])
    timeline_shortfall = max(0, 100 - project["timeline_adherence_pct"])

    probability = min(100.0, (0.6 * progress_gap) + (0.4 * timeline_shortfall) * 0.5)
    predicted_days = int(round(progress_gap * 1.5 + timeline_shortfall * 0.8))
    return round(probability, 1), predicted_days


def detect_anomalies(project: dict) -> list[AiExplanation]:
    """Rule-based anomaly flags — the "Automatic Anomaly Detection" feature.

    Each rule below is intentionally simple and stated in plain language so
    a human reviewer can immediately see *why* something was flagged.
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
    """Full AI analysis bundle for a single project — used by the
    /api/v1/ai/projects/{id}/analysis endpoint and by the Project Detail
    page's "AI Analysis Summary" panel."""
    health_score = compute_health_score(project)
    delay_probability, predicted_days = compute_delay_probability(project)
    explanations = detect_anomalies(project)

    return ProjectAiAnalysis(
        project_id=project["id"],
        ai_health_score=health_score,
        delay_probability_pct=delay_probability,
        predicted_delay_days=predicted_days,
        verified_progress_pct=None,  # requires the Photo Verification (CV) pipeline
        explanations=explanations,
    )
