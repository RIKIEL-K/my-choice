"""
VoteRecord — enregistrement d'un vote consommé depuis RabbitMQ.

Ce modèle est propre au vote-service. Chaque ligne correspond à un
événement vote_cast reçu via le broker de messages.

Contrainte d'unicité : un seul vote par électeur par élection.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TimestampMixin


class VoteRecord(Base, TimestampMixin):
    __tablename__ = "vote_records"
    __table_args__ = (
        # Un seul vote par électeur par élection — même contrainte que election-service
        UniqueConstraint("election_id", "voter_id", name="uq_vote_record_election_voter"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    # Identifiants provenant du message RabbitMQ
    election_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    voter_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    candidate_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    # Horodatage du vote (tel que défini par election-service)
    voted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
