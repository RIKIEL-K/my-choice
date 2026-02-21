import asyncio
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from httpx import AsyncClient, ASGITransport

from app.core.config import settings
from app.core.startup import database
from app.db.base import Base
from main import app

# Create a test-specific engine
test_engine = create_async_engine(settings.DATABASE_URL)
TestSessionMaker = async_sessionmaker(test_engine, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    """Create all tables before tests, drop after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await database.connect()
    yield
    await database.disconnect()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(autouse=True)
async def clean_tables():
    """Truncate all tables between tests for isolation."""
    yield
    async with test_engine.begin() as conn:
        await conn.execute(__import__("sqlalchemy").text("SET FOREIGN_KEY_CHECKS=0"))
        for table in ["votes", "candidates", "elections", "election_users"]:
            await conn.execute(__import__("sqlalchemy").text(f"TRUNCATE TABLE {table}"))
        await conn.execute(__import__("sqlalchemy").text("SET FOREIGN_KEY_CHECKS=1"))


@pytest_asyncio.fixture
async def async_session() -> AsyncSession:
    async with TestSessionMaker() as session:
        yield session


@pytest_asyncio.fixture
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
