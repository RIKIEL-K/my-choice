"""
Vote model — records a user's vote in an election.
Unique constraint: one vote per user per election.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import ForeignKey, DateTime, UniqueConstraint, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (
        # Guarantee one vote per voter per election at the DB level
        UniqueConstraint("election_id", "voter_id", name="uq_vote_election_voter"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    election_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("elections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # voter_id = election_users.user_id
    voter_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    candidate_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False
    )
    voted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relations
    election: Mapped["Election"] = relationship(
        "Election", back_populates="votes"
    )
    voter: Mapped["ElectionUser"] = relationship( 
        "ElectionUser",
        primaryjoin="Vote.voter_id == ElectionUser.user_id",
        foreign_keys="[Vote.voter_id]",
        back_populates="votes",
        lazy="select",
    )
    candidate: Mapped["Candidate"] = relationship(
        "Candidate", back_populates="votes_received"
    )
