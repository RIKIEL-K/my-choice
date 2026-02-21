"""
ElectionUser model — one row per user registered in auth-service.
Created automatically when auth-service fires the user-created webhook.
"""
import uuid
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class ElectionUser(Base, TimestampMixin):
    __tablename__ = "election_users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    # Same UUID as the user in auth-service — the single cross-service link
    user_id: Mapped[str] = mapped_column(String(36), unique=True, nullable=False, index=True)
    display_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Relations
    candidacies: Mapped[list["Candidate"]] = relationship(
        "Candidate",
        primaryjoin="ElectionUser.user_id == Candidate.user_id",
        foreign_keys="[Candidate.user_id]",
        back_populates="election_user",
        lazy="select",
    )
    votes: Mapped[list["Vote"]] = relationship( 
        "Vote",
        primaryjoin="ElectionUser.user_id == Vote.voter_id",
        foreign_keys="[Vote.voter_id]",
        back_populates="voter",
        lazy="select",
    )
