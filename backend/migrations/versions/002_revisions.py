"""Persist source project changes separately from analysis."""
from alembic import op
import sqlalchemy as sa
revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None
def upgrade():
    op.create_table("project_revisions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("project_id", sa.Integer, sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("actor_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("source", sa.String(50), nullable=False),
        sa.Column("values", sa.JSON, nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now(), nullable=False))
    op.create_index("ix_project_revisions_project_id", "project_revisions", ["project_id"])
def downgrade():
    raise RuntimeError("Restore a verified backup to downgrade.")
