"""
Database seed script.

Populates the database with the same data the frontend currently hardcodes
in `mockData.ts`, so the backend returns matching data when the dashboard
switches from mock imports to real API calls.

Run:
    python -m app.seed
"""

from __future__ import annotations

import logging
from datetime import date

from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models import (
    Agency,
    AiScoreHistory,
    Constituency,
    ConstituencyTrend,
    GapLevelEnum,
    InspectionStatusEnum,
    MilestoneStatusEnum,
    NeedLevelEnum,
    Project,
    ProjectFinancialTrend,
    ProjectMilestone,
    ProjectPhoto,
    ProjectStatusEnum,
    Recommendation,
    RiskLevelEnum,
    SectorGap,
    User,
    UserRoleEnum,
    WardGap,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed():
    """Drop all tables and re-create with seed data."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(Project).count() > 0:
            logger.info("Database already seeded — skipping.")
            return

        logger.info("Seeding database...")

        # ── Constituencies ──────────────────────────────────────────────
        berasia = Constituency(id=1, name="Berasia, Bhopal MP", state="Madhya Pradesh", district="Bhopal")
        huzur = Constituency(id=2, name="Huzur, Bhopal MP", state="Madhya Pradesh", district="Bhopal")
        phanda = Constituency(id=3, name="Phanda, Bhopal MP", state="Madhya Pradesh", district="Bhopal")
        bairagarh = Constituency(id=4, name="Bairagarh, Bhopal MP", state="Madhya Pradesh", district="Bhopal")
        kolar = Constituency(id=5, name="Kolar, Bhopal MP", state="Madhya Pradesh", district="Bhopal")
        misrod = Constituency(id=6, name="Misrod, Bhopal MP", state="Madhya Pradesh", district="Bhopal")
        neelbad = Constituency(id=7, name="Neelbad, Bhopal MP", state="Madhya Pradesh", district="Bhopal")
        bagmugaliya = Constituency(id=8, name="Bagmugaliya, Bhopal MP", state="Madhya Pradesh", district="Bhopal")
        ayodhya = Constituency(id=9, name="Ayodhya Bypass, Bhopal MP", state="Madhya Pradesh", district="Bhopal")
        mandideep = Constituency(id=10, name="Mandideep, Raisen MP", state="Madhya Pradesh", district="Raisen")
        db.add_all([berasia, huzur, phanda, bairagarh, kolar, misrod, neelbad, bagmugaliya, ayodhya, mandideep])

        # ── Agencies ────────────────────────────────────────────────────
        agencies_data = [
            {"id": 1, "name": "Rural Development Dept.", "projects_count": 48, "completion_rate_pct": 72, "avg_delay_days": 42, "cost_variation_pct": 12, "stalled_projects": 7, "update_consistency_pct": 68, "ai_score": 68},
            {"id": 2, "name": "Public Works Dept.", "projects_count": 36, "completion_rate_pct": 78, "avg_delay_days": 36, "cost_variation_pct": 8, "stalled_projects": 5, "update_consistency_pct": 71, "ai_score": 71},
            {"id": 3, "name": "Water Resources Dept.", "projects_count": 28, "completion_rate_pct": 61, "avg_delay_days": 58, "cost_variation_pct": 18, "stalled_projects": 9, "update_consistency_pct": 52, "ai_score": 52},
            {"id": 4, "name": "Education Dept.", "projects_count": 22, "completion_rate_pct": 85, "avg_delay_days": 28, "cost_variation_pct": 6, "stalled_projects": 3, "update_consistency_pct": 76, "ai_score": 76},
            {"id": 5, "name": "Health Dept.", "projects_count": 18, "completion_rate_pct": 56, "avg_delay_days": 62, "cost_variation_pct": 21, "stalled_projects": 8, "update_consistency_pct": 35, "ai_score": 35},
            {"id": 6, "name": "Women & Child Dev. Dept.", "projects_count": 16, "completion_rate_pct": 75, "avg_delay_days": 35, "cost_variation_pct": 9, "stalled_projects": 3, "update_consistency_pct": 69, "ai_score": 69},
            {"id": 7, "name": "Municipal Corporation", "projects_count": 14, "completion_rate_pct": 80, "avg_delay_days": 31, "cost_variation_pct": 7, "stalled_projects": 2, "update_consistency_pct": 74, "ai_score": 74},
            {"id": 8, "name": "Urban Dev. Dept.", "projects_count": 10, "completion_rate_pct": 65, "avg_delay_days": 48, "cost_variation_pct": 14, "stalled_projects": 4, "update_consistency_pct": 58, "ai_score": 58},
        ]
        for ad in agencies_data:
            db.add(Agency(**ad))

        # ── Projects (matching mockData.ts) ─────────────────────────────
        projects_data = [
            {
                "id": 1, "code": "MPLADS/2023/001", "name": "Construction of Community Hall",
                "sector": "Community Infrastructure", "constituency_id": 1, "constituency": "Berasia, Bhopal MP",
                "state": "Madhya Pradesh", "district": "Bhopal", "lat": 23.4, "lng": 77.42,
                "agency_id": 1, "agency": "Rural Development Dept.",
                "status": ProjectStatusEnum.in_progress, "risk_level": RiskLevelEnum.high,
                "ai_score": 32, "ai_health_score": 32, "delay_probability_pct": 78, "predicted_delay_days": 45,
                "financial_progress_pct": 82, "physical_progress_pct": 48,
                "sanctioned_amount_cr": 50, "released_amount_cr": 42.5, "expenditure_cr": 41,
                "timeline_adherence_pct": 40, "pending_approvals": 3, "update_consistency_pct": 50,
                "start_date": date(2023, 1, 12), "expected_end_date": date(2024, 12, 31),
            },
            {
                "id": 2, "code": "MPLADS/2023/014", "name": "Rural Road Development",
                "sector": "Roads & Transport", "constituency_id": 2, "constituency": "Huzur, Bhopal MP",
                "state": "Madhya Pradesh", "district": "Bhopal", "lat": 23.32, "lng": 77.5,
                "agency_id": 2, "agency": "Public Works Dept.",
                "status": ProjectStatusEnum.delayed, "risk_level": RiskLevelEnum.high,
                "ai_score": 45, "ai_health_score": 55, "delay_probability_pct": 82, "predicted_delay_days": 78,
                "financial_progress_pct": 91, "physical_progress_pct": 40,
                "sanctioned_amount_cr": 30, "released_amount_cr": 27.3, "expenditure_cr": 27.3,
                "timeline_adherence_pct": 35, "pending_approvals": 2, "update_consistency_pct": 45,
                "start_date": date(2022, 11, 1), "expected_end_date": date(2024, 6, 30),
            },
            {
                "id": 3, "code": "MPLADS/2022/087", "name": "Drinking Water Facility",
                "sector": "Drinking Water", "constituency_id": 3, "constituency": "Phanda, Bhopal MP",
                "state": "Madhya Pradesh", "district": "Bhopal", "lat": 23.28, "lng": 77.35,
                "agency_id": 3, "agency": "Water Resources Dept.",
                "status": ProjectStatusEnum.in_progress, "risk_level": RiskLevelEnum.medium,
                "ai_score": 61, "ai_health_score": 61, "delay_probability_pct": 55, "predicted_delay_days": 28,
                "financial_progress_pct": 67, "physical_progress_pct": 65,
                "sanctioned_amount_cr": 18, "released_amount_cr": 12.1, "expenditure_cr": 12.1,
                "timeline_adherence_pct": 60, "pending_approvals": 1, "update_consistency_pct": 70,
                "start_date": date(2023, 3, 5), "expected_end_date": date(2024, 9, 30),
            },
            {
                "id": 4, "code": "MPLADS/2023/102", "name": "School Building Renovation",
                "sector": "Education", "constituency_id": 4, "constituency": "Bairagarh, Bhopal MP",
                "state": "Madhya Pradesh", "district": "Bhopal", "lat": 23.3, "lng": 77.38,
                "agency_id": 4, "agency": "Education Dept.",
                "status": ProjectStatusEnum.in_progress, "risk_level": RiskLevelEnum.medium,
                "ai_score": 64, "ai_health_score": 54, "delay_probability_pct": 58, "predicted_delay_days": 32,
                "financial_progress_pct": 54, "physical_progress_pct": 52,
                "sanctioned_amount_cr": 12, "released_amount_cr": 6.5, "expenditure_cr": 6.5,
                "timeline_adherence_pct": 50, "pending_approvals": 2, "update_consistency_pct": 55,
                "start_date": date(2023, 2, 18), "expected_end_date": date(2024, 8, 30),
            },
            {
                "id": 5, "code": "MPLADS/2023/076", "name": "Primary Health Centre",
                "sector": "Healthcare", "constituency_id": 5, "constituency": "Kolar, Bhopal MP",
                "state": "Madhya Pradesh", "district": "Bhopal", "lat": 23.15, "lng": 77.4,
                "agency_id": 5, "agency": "Health Dept.",
                "status": ProjectStatusEnum.completed, "risk_level": RiskLevelEnum.low,
                "ai_score": 18, "ai_health_score": 92, "delay_probability_pct": 5, "predicted_delay_days": 0,
                "financial_progress_pct": 100, "physical_progress_pct": 100,
                "sanctioned_amount_cr": 20, "released_amount_cr": 20, "expenditure_cr": 19.8,
                "timeline_adherence_pct": 96, "pending_approvals": 0, "update_consistency_pct": 98,
                "start_date": date(2022, 6, 1), "expected_end_date": date(2023, 6, 1),
            },
            {
                "id": 6, "code": "MPLADS/2022/091", "name": "Solar Street Lighting",
                "sector": "Community Infrastructure", "constituency_id": 6, "constituency": "Misrod, Bhopal MP",
                "state": "Madhya Pradesh", "district": "Bhopal", "lat": 23.22, "lng": 77.48,
                "agency_id": 8, "agency": "Urban Dev. Dept.",
                "status": ProjectStatusEnum.delayed, "risk_level": RiskLevelEnum.high,
                "ai_score": 78, "ai_health_score": 38, "delay_probability_pct": 88, "predicted_delay_days": 86,
                "financial_progress_pct": 36, "physical_progress_pct": 22,
                "sanctioned_amount_cr": 8, "released_amount_cr": 2.9, "expenditure_cr": 2.9,
                "timeline_adherence_pct": 25, "pending_approvals": 4, "update_consistency_pct": 30,
                "start_date": date(2022, 9, 15), "expected_end_date": date(2023, 12, 31),
            },
            {
                "id": 7, "code": "MPLADS/2022/063", "name": "Drainage System Improvement",
                "sector": "Sanitation", "constituency_id": 7, "constituency": "Neelbad, Bhopal MP",
                "state": "Madhya Pradesh", "district": "Bhopal", "lat": 23.34, "lng": 77.33,
                "agency_id": 2, "agency": "Public Works Dept.",
                "status": ProjectStatusEnum.delayed, "risk_level": RiskLevelEnum.high,
                "ai_score": 71, "ai_health_score": 41, "delay_probability_pct": 80, "predicted_delay_days": 62,
                "financial_progress_pct": 48, "physical_progress_pct": 35,
                "sanctioned_amount_cr": 15, "released_amount_cr": 7.2, "expenditure_cr": 7.2,
                "timeline_adherence_pct": 30, "pending_approvals": 3, "update_consistency_pct": 40,
                "start_date": date(2022, 8, 1), "expected_end_date": date(2023, 10, 31),
            },
            {
                "id": 8, "code": "MPLADS/2023/118", "name": "Anganwadi Centre Construction",
                "sector": "Community Infrastructure", "constituency_id": 8, "constituency": "Bagmugaliya, Bhopal MP",
                "state": "Madhya Pradesh", "district": "Bhopal", "lat": 23.27, "lng": 77.44,
                "agency_id": 6, "agency": "Women & Child Dev. Dept.",
                "status": ProjectStatusEnum.in_progress, "risk_level": RiskLevelEnum.medium,
                "ai_score": 56, "ai_health_score": 60, "delay_probability_pct": 50, "predicted_delay_days": 25,
                "financial_progress_pct": 60, "physical_progress_pct": 58,
                "sanctioned_amount_cr": 10, "released_amount_cr": 6, "expenditure_cr": 6,
                "timeline_adherence_pct": 55, "pending_approvals": 1, "update_consistency_pct": 62,
                "start_date": date(2023, 4, 10), "expected_end_date": date(2024, 7, 31),
            },
            {
                "id": 9, "code": "MPLADS/2022/045", "name": "Park Development",
                "sector": "Community Infrastructure", "constituency_id": 9, "constituency": "Ayodhya Bypass, Bhopal MP",
                "state": "Madhya Pradesh", "district": "Bhopal", "lat": 23.24, "lng": 77.41,
                "agency_id": 7, "agency": "Municipal Corporation",
                "status": ProjectStatusEnum.in_progress, "risk_level": RiskLevelEnum.medium,
                "ai_score": 49, "ai_health_score": 66, "delay_probability_pct": 40, "predicted_delay_days": 18,
                "financial_progress_pct": 75, "physical_progress_pct": 70,
                "sanctioned_amount_cr": 6, "released_amount_cr": 4.5, "expenditure_cr": 4.5,
                "timeline_adherence_pct": 65, "pending_approvals": 0, "update_consistency_pct": 72,
                "start_date": date(2023, 5, 1), "expected_end_date": date(2024, 3, 31),
            },
            {
                "id": 10, "code": "MPLADS/2023/129", "name": "Minor Bridge Construction",
                "sector": "Roads & Transport", "constituency_id": 10, "constituency": "Mandideep, Raisen MP",
                "state": "Madhya Pradesh", "district": "Raisen", "lat": 23.1, "lng": 77.53,
                "agency_id": 2, "agency": "Public Works Dept.",
                "status": ProjectStatusEnum.not_started, "risk_level": RiskLevelEnum.high,
                "ai_score": 82, "ai_health_score": 20, "delay_probability_pct": 90, "predicted_delay_days": 120,
                "financial_progress_pct": 20, "physical_progress_pct": 15,
                "sanctioned_amount_cr": 25, "released_amount_cr": 5, "expenditure_cr": 5,
                "timeline_adherence_pct": 15, "pending_approvals": 5, "update_consistency_pct": 20,
                "start_date": date(2023, 6, 1), "expected_end_date": date(2024, 11, 30),
            },
        ]
        for pd_item in projects_data:
            db.add(Project(**pd_item))

        # ── Project 1 milestones (Construction of Community Hall) ────────
        milestones = [
            ProjectMilestone(project_id=1, label="Project Sanctioned", date=date(2023, 1, 12), status=MilestoneStatusEnum.completed),
            ProjectMilestone(project_id=1, label="Work Order Issued", date=date(2023, 2, 15), status=MilestoneStatusEnum.completed),
            ProjectMilestone(project_id=1, label="Foundation Completed", date=date(2023, 6, 20), status=MilestoneStatusEnum.completed),
            ProjectMilestone(project_id=1, label="Structure Work", date=date(2023, 9, 30), status=MilestoneStatusEnum.delayed),
            ProjectMilestone(project_id=1, label="Finishing Work", date=date(2024, 3, 31), status=MilestoneStatusEnum.in_progress),
            ProjectMilestone(project_id=1, label="Project Completion", date=date(2024, 12, 31), status=MilestoneStatusEnum.pending),
        ]
        db.add_all(milestones)

        # ── Project 1 photos ────────────────────────────────────────────
        photos = [
            ProjectPhoto(project_id=1, file_url="/images/site-1.jpg", upload_date=date(2024, 1, 12)),
            ProjectPhoto(project_id=1, file_url="/images/site-2.jpg", upload_date=date(2024, 3, 18)),
            ProjectPhoto(project_id=1, file_url="/images/site-3.jpg", upload_date=date(2024, 5, 25)),
            ProjectPhoto(project_id=1, file_url="/images/site-4.jpg", upload_date=date(2024, 8, 10)),
        ]
        db.add_all(photos)

        # ── Project 1 financial trend ───────────────────────────────────
        financial_trend = [
            ProjectFinancialTrend(project_id=1, quarter="Q3 2023", cumulative=8, expected=12),
            ProjectFinancialTrend(project_id=1, quarter="Q4 2023", cumulative=18, expected=22),
            ProjectFinancialTrend(project_id=1, quarter="Q1 2024", cumulative=26, expected=32),
            ProjectFinancialTrend(project_id=1, quarter="Q2 2024", cumulative=33, expected=40),
            ProjectFinancialTrend(project_id=1, quarter="Q3 2024", cumulative=38, expected=46),
            ProjectFinancialTrend(project_id=1, quarter="Q4 2024", cumulative=41, expected=50),
        ]
        db.add_all(financial_trend)

        # ── Sector gaps (Berasia constituency) ──────────────────────────
        sector_gaps = [
            SectorGap(constituency_id=1, sector="Drinking Water", need=48, need_score=48, covered=13, covered_score=13, gap_pct=72, gap_level=GapLevelEnum.high),
            SectorGap(constituency_id=1, sector="Healthcare", need=36, need_score=36, covered=15, covered_score=15, gap_pct=42, gap_level=GapLevelEnum.high),
            SectorGap(constituency_id=1, sector="Sanitation", need=28, need_score=28, covered=14, covered_score=14, gap_pct=51, gap_level=GapLevelEnum.medium),
            SectorGap(constituency_id=1, sector="Roads & Transport", need=22, need_score=22, covered=17, covered_score=17, gap_pct=76, gap_level=GapLevelEnum.low),
            SectorGap(constituency_id=1, sector="Community Infrastructure", need=31, need_score=31, covered=18, covered_score=18, gap_pct=58, gap_level=GapLevelEnum.medium),
            SectorGap(constituency_id=1, sector="Education", need=25, need_score=25, covered=17, covered_score=17, gap_pct=68, gap_level=GapLevelEnum.low),
        ]
        db.add_all(sector_gaps)

        # ── Ward gaps ──────────────────────────────────────────────────
        ward_gaps = [
            WardGap(constituency_id=1, rank=1, area="Kheda", block="Berasia", gap_sector="Drinking Water", need_level=NeedLevelEnum.high),
            WardGap(constituency_id=1, rank=2, area="Sanchi Road", block="Berasia", gap_sector="Healthcare", need_level=NeedLevelEnum.high),
            WardGap(constituency_id=1, rank=3, area="Barkheda", block="Berasia", gap_sector="Sanitation", need_level=NeedLevelEnum.high),
            WardGap(constituency_id=1, rank=4, area="Salampatar", block="Phanda", gap_sector="Drinking Water", need_level=NeedLevelEnum.medium),
            WardGap(constituency_id=1, rank=5, area="Ibrahimpura", block="Berasia", gap_sector="Healthcare", need_level=NeedLevelEnum.medium),
            WardGap(constituency_id=1, rank=6, area="Jatkheri", block="Huzur", gap_sector="Community Infra.", need_level=NeedLevelEnum.medium),
            WardGap(constituency_id=1, rank=7, area="Badwai", block="Neelbad", gap_sector="Drinking Water", need_level=NeedLevelEnum.medium),
            WardGap(constituency_id=1, rank=8, area="Ratibad", block="Berasia", gap_sector="Education", need_level=NeedLevelEnum.low),
        ]
        db.add_all(ward_gaps)

        # ── Constituency trends ─────────────────────────────────────────
        trends = [
            ConstituencyTrend(constituency_id=1, year="2021", funds_released_cr=45, expenditure_cr=32, avg_physical_progress_pct=28),
            ConstituencyTrend(constituency_id=1, year="2022", funds_released_cr=56, expenditure_cr=96, avg_physical_progress_pct=46),
            ConstituencyTrend(constituency_id=1, year="2023", funds_released_cr=71, expenditure_cr=96, avg_physical_progress_pct=63),
            ConstituencyTrend(constituency_id=1, year="2024", funds_released_cr=98, expenditure_cr=123, avg_physical_progress_pct=78),
        ]
        db.add_all(trends)

        # ── Recommendations ────────────────────────────────────────────
        recs = [
            Recommendation(constituency_id=1, priority=1, type="High Gap", title="Prioritize Drinking Water projects", description="Initiate 8-10 projects in rural Berasia, Neelbad and Phanda blocks."),
            Recommendation(constituency_id=1, priority=2, type="High Gap", title="Initiate healthcare facilities", description="Establish 5-7 PHC/CHC facilities in underserved gram panchayats."),
            Recommendation(constituency_id=1, priority=3, type="Medium Gap", title="Focus on rural sanitation", description="Focus on rural areas with low sanitation coverage."),
            Recommendation(constituency_id=1, priority=4, type="Monitoring", title="Strengthen monitoring", description="Conduct field inspections for 21 high-risk projects."),
            Recommendation(constituency_id=1, priority=5, type="Convergence", title="Convergence opportunity", description="Align with Jal Jeevan Mission and Ayushman Bharat."),
        ]
        db.add_all(recs)

        # ── Users ──────────────────────────────────────────────────────
        users = [
            User(
                username="arjun.mehta",
                hashed_password=hash_password("demo123"),
                role=UserRoleEnum.mp,
                display_name="Shri Arjun Mehta",
                constituency_id=1,
            ),
            User(
                username="admin",
                hashed_password=hash_password("admin123"),
                role=UserRoleEnum.admin,
                display_name="System Admin",
            ),
            User(
                username="inspector.sharma",
                hashed_password=hash_password("demo123"),
                role=UserRoleEnum.inspecting_officer,
                display_name="Ramesh Sharma",
                constituency_id=1,
            ),
            User(
                username="nodal.bhopal",
                hashed_password=hash_password("demo123"),
                role=UserRoleEnum.district_nodal_authority,
                display_name="Dr. Priya Singh",
                constituency_id=1,
            ),
        ]
        db.add_all(users)

        db.commit()
        logger.info("Database seeded successfully!")
        logger.info(f"  - {len(projects_data)} projects")
        logger.info(f"  - {len(agencies_data)} agencies")
        logger.info(f"  - 10 constituencies")
        logger.info(f"  - {len(users)} users")
        logger.info(f"  - {len(sector_gaps)} sector gaps")
        logger.info(f"  - {len(ward_gaps)} ward gaps")
        logger.info(f"  - {len(trends)} trend data points")
        logger.info(f"  - {len(recs)} recommendations")
        logger.info(f"  - {len(milestones)} milestones")
        logger.info(f"  - {len(photos)} photos")
        logger.info(f"  - {len(financial_trend)} financial trend points")
        logger.info("")
        logger.info("Demo credentials:")
        logger.info("  MP login:        arjun.mehta / demo123")
        logger.info("  Admin login:     admin / admin123")
        logger.info("  Inspector login: inspector.sharma / demo123")
        logger.info("  Nodal login:     nodal.bhopal / demo123")

    except Exception:
        db.rollback()
        logger.exception("Seeding failed")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
