from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def update_user(self, user: User, update_data: dict) -> User:
        for field, value in update_data.items():
            setattr(user, field, value)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def get_all(
        self,
        page: int = 1,
        size: int = 50,
        search: str | None = None,
        status_filter: str | None = None,   # "active" | "suspended" | "pending"
    ) -> tuple[list[User], int]:
        query = select(User)
        count_q = select(func.count()).select_from(User)

        if search:
            like = f"%{search}%"
            query = query.where(or_(User.email.ilike(like)))
            count_q = count_q.where(or_(User.email.ilike(like)))

        if status_filter == "active":
            query = query.where(User.is_active == True, User.is_verified == True, User.is_locked == False) 
            count_q = count_q.where(User.is_active == True, User.is_verified == True, User.is_locked == False)  
        elif status_filter == "suspended":
            query = query.where(or_(User.is_active == False, User.is_locked == True))  
            count_q = count_q.where(or_(User.is_active == False, User.is_locked == True)) 
        elif status_filter == "pending":
            query = query.where(User.is_active == True, User.is_verified == False)
            count_q = count_q.where(User.is_active == True, User.is_verified == False)  

        total = (await self.session.execute(count_q)).scalar_one()
        offset = (page - 1) * size
        result = await self.session.execute(query.order_by(User.email).offset(offset).limit(size))
        return result.scalars().all(), total

    async def get_by_id(self, user_id: str) -> User | None:
        import uuid as _uuid
        try:
            uid = _uuid.UUID(user_id)
        except ValueError:
            return None
        result = await self.session.execute(select(User).where(User.id == uid))
        return result.scalar_one_or_none()

    async def set_active(self, user: User, is_active: bool) -> User:
        user.is_active = is_active
        if is_active:
            user.is_locked = False
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def count_by_status(self) -> dict:
        total = (await self.session.execute(select(func.count()).select_from(User))).scalar_one()
        active = (await self.session.execute(
            select(func.count()).select_from(User).where(
                User.is_active == True, User.is_verified == True, User.is_locked == False 
            )
        )).scalar_one()
        suspended = (await self.session.execute(
            select(func.count()).select_from(User).where(
                or_(User.is_active == False, User.is_locked == True)  
            )
        )).scalar_one()
        pending = (await self.session.execute(
            select(func.count()).select_from(User).where(
                User.is_active == True, User.is_verified == False
            )
        )).scalar_one()
        return {"total": total, "active": active, "suspended": suspended, "pending": pending}
