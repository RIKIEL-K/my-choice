"""
Base SQLAlchemy pour le vote-service.

Fournit la classe de base déclarative et le mixin de timestamps
(même convention que election-service pour la cohérence).
"""
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from sqlalchemy import DateTime
from datetime import datetime, timezone

Base = declarative_base()


class TimestampMixin:
    """Ajoute created_at et updated_at automatiquement sur chaque row."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
