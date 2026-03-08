import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.election_user import ElectionUser


class ElectionUserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_user_id(self, user_id: str) -> ElectionUser | None:
        result = await self.session.execute(
            select(ElectionUser).where(ElectionUser.user_id == str(user_id))
        )
        return result.scalar_one_or_none()

    async def create(
        self, user_id: str, email: str, display_name: str | None = None
    ) -> ElectionUser:
        eu = ElectionUser(user_id=str(user_id), email=email, display_name=display_name)
        self.session.add(eu)
        await self.session.commit()
        await self.session.refresh(eu)
        return eu

    async def count_all(self) -> int:
        result = await self.session.execute(
            select(func.count()).select_from(ElectionUser)
        )
        return result.scalar_one()
