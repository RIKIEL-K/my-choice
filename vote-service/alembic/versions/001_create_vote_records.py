"""create vote_records table

Revision ID: 001
Revises: None
Create Date: 2026-04-16
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Crée la table vote_records — stockage des événements de vote
    consommés depuis RabbitMQ.

    Contrainte d'unicité sur (election_id, voter_id) pour garantir
    un seul vote par électeur par élection, même en cas de doublon
    de message RabbitMQ.
    """
    op.create_table(
        "vote_records",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("election_id", sa.String(36), nullable=False, index=True),
        sa.Column("voter_id", sa.String(36), nullable=False, index=True),
        sa.Column("candidate_id", sa.String(36), nullable=False, index=True),
        sa.Column(
            "voted_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        ),
        # Un seul vote par électeur par élection
        sa.UniqueConstraint("election_id", "voter_id", name="uq_vote_record_election_voter"),
    )


def downgrade() -> None:
    op.drop_table("vote_records")
