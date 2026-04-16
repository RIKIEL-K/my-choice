"""
Session async SQLAlchemy pour le vote-service.

Fournit le moteur async et un générateur de sessions
utilisable comme dépendance FastAPI (Depends).
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL
engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Dépendance FastAPI — fournit une session DB par requête."""
    async with async_session_maker() as session:
        yield session
