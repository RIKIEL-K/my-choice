from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable
from app.db.base import Base
from app.models.oauth_account import OAuthAccount
from sqlalchemy import Boolean, Integer, DateTime, String
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List
import uuid
from datetime import datetime


class User(SQLAlchemyBaseUserTable[uuid.UUID], Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )

    failed_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_attempted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None, nullable=True
    )
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    locked_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None, nullable=True
    )
    oauth_accounts: Mapped[List[OAuthAccount]] = relationship(
        "OAuthAccount", lazy="joined"
    )
