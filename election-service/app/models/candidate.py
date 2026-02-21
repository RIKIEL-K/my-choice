"""
Candidate model — a user who has registered to run in an election.
"""
import uuid
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class Candidate(Base, TimestampMixin):
    __tablename__ = "candidates"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    election_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("elections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # user_id from auth-service (links to election_users.user_id)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Relations
    election: Mapped["Election"] = relationship(  # noqa: F821
        "Election", back_populates="candidates"
    )
    election_user: Mapped["ElectionUser"] = relationship(  # noqa: F821
        "ElectionUser",
        primaryjoin="Candidate.user_id == ElectionUser.user_id",
        foreign_keys="[Candidate.user_id]",
        back_populates="candidacies",
        lazy="select",
    )
    votes_received: Mapped[list["Vote"]] = relationship(  # noqa: F821
        "Vote", back_populates="candidate", lazy="select"
    )
