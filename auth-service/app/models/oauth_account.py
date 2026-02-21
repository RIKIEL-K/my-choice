from fastapi_users_db_sqlalchemy import SQLAlchemyBaseOAuthAccountTable
from app.db.base import Base
from sqlalchemy import Column, Integer, ForeignKey, String


import uuid

class OAuthAccount(SQLAlchemyBaseOAuthAccountTable[uuid.UUID], Base):
    __tablename__ = "oauth_accounts"
    id: int = Column(Integer, primary_key=True, autoincrement=True)  # type: ignore
    user_id = Column(ForeignKey("users.id", ondelete="cascade"), nullable=False)
