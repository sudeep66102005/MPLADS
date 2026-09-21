"""Initial operational schema; preserves existing tables and adds missing ones.
This baseline creates the v1 schema. Future schema changes require new revisions.
"""
from alembic import op
from migrations.schema_v1 import Base
revision = "001"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    Base.metadata.create_all(op.get_bind(), checkfirst=True)

def downgrade():
    raise RuntimeError("Destructive downgrade is disabled. Restore a verified backup instead.")
