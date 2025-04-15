"""discount end date should be nullable

Revision ID: ecadf813f5d9
Revises: db3bafd9e592
Create Date: 2025-04-15 13:44:33.923508

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ecadf813f5d9'
down_revision: Union[str, None] = 'db3bafd9e592'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
