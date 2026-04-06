"""
Candidate model — a user who has registered to run in an election.
"""
import uuid
from enum import Enum as PyEnum
from sqlalchemy import String, Text, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin
import json


class ApprovalStatus(str, PyEnum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


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
    program: Mapped[str | None] = mapped_column(String(200), nullable=True)
    position: Mapped[str | None] = mapped_column(String(120), nullable=True)
    slogan: Mapped[str | None] = mapped_column(String(300), nullable=True)
    # JSON-encoded list of strings: '["Priority A", "Priority B"]'
    priorities: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Admin approval status — candidates must be approved before voters can see them
    approval_status: Mapped[ApprovalStatus] = mapped_column(
        Enum(ApprovalStatus),
        default=ApprovalStatus.pending,
        nullable=False,
        index=True,
    )

    @property
    def priorities_list(self) -> list[str]:
        if not self.priorities:
            return []
        try:
            return json.loads(self.priorities)
        except Exception:
            return []

    # Relations
    election: Mapped["Election"] = relationship(  
        "Election", back_populates="candidates"
    )
    election_user: Mapped["ElectionUser"] = relationship(  
        "ElectionUser",
        primaryjoin="Candidate.user_id == ElectionUser.user_id",
        foreign_keys="[Candidate.user_id]",
        back_populates="candidacies",
        lazy="select",
    )
    votes_received: Mapped[list["Vote"]] = relationship(  
        "Vote", back_populates="candidate", lazy="select"
    )
