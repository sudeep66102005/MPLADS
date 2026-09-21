"""Optional database-backed evidence for hosts without a persistent filesystem."""
from alembic import op
import sqlalchemy as sa
revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None
def upgrade():
    op.create_table("evidence_content",
        sa.Column("evidence_id", sa.Integer, sa.ForeignKey("evidence.id"), primary_key=True),
        sa.Column("payload", sa.LargeBinary, nullable=True),
        sa.Column("details", sa.JSON, nullable=False))
def downgrade():
    raise RuntimeError("Restore a verified backup to downgrade.")

