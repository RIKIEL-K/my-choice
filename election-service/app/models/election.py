"""
Election model — represents a student election event.
"""
import uuid
from enum import Enum as PyEnum
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Enum, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class ElectionStatus(str, PyEnum):
    draft = "draft"
    active = "active"
    closed = "closed"


class Election(Base, TimestampMixin):
    __tablename__ = "elections"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    end_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    status: Mapped[ElectionStatus] = mapped_column(
        Enum(ElectionStatus), default=ElectionStatus.draft, nullable=False, index=True
    )
    # Total number of eligible voters (set by admin when creating/updating election)
    total_voters: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    # UUID of the admin who created the election (from auth-service)
    created_by: Mapped[str | None] = mapped_column(String(36), nullable=True)

    # Relations
    candidates: Mapped[list["Candidate"]] = relationship(  # noqa: F821
        "Candidate", back_populates="election", lazy="select", cascade="all, delete-orphan"
    )
    votes: Mapped[list["Vote"]] = relationship(  # noqa: F821
        "Vote", back_populates="election", lazy="select", cascade="all, delete-orphan"
    )

    @property
    def vote_count(self) -> int:
        return len(self.votes)

    @property
    def participation(self) -> float:
        if self.total_voters == 0:
            return 0.0
        return round((self.vote_count / self.total_voters) * 100, 2)
