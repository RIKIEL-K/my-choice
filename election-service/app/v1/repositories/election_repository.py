import uuid
from datetime import date, datetime, timezone
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.election import Election, ElectionStatus
from app.v1.schemas.election import ElectionCreate, ElectionUpdate


class ElectionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(
        self,
        status: ElectionStatus | None = None,
        page: int = 1,
        size: int = 20,
    ) -> tuple[list[Election], int]:
        query = select(Election).options(
            selectinload(Election.candidates),
            selectinload(Election.votes),
        )
        count_query = select(func.count()).select_from(Election)

        if status:
            query = query.where(Election.status == status)
            count_query = count_query.where(Election.status == status)

        total = (await self.session.execute(count_query)).scalar_one()
        offset = (page - 1) * size
        result = await self.session.execute(query.offset(offset).limit(size))
        return result.scalars().all(), total

    async def get_by_id(self, election_id) -> Election | None:
        result = await self.session.execute(
            select(Election)
            .where(Election.id == str(election_id))
            .options(
                selectinload(Election.candidates),
                selectinload(Election.votes),
            )
        )
        return result.scalar_one_or_none()

    async def create(self, data: ElectionCreate, created_by: str | None = None) -> Election:
        election = Election(
            title=data.title,
            description=data.description,
            start_date=data.start_date,
            end_date=data.end_date,
            status=data.status,
            total_voters=data.total_voters,
            created_by=created_by,
        )
        self.session.add(election)
        await self.session.commit()
        await self.session.refresh(election)
        return election

    async def update(self, election: Election, data: ElectionUpdate) -> Election:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(election, field, value)
        await self.session.commit()
        await self.session.refresh(election)
        return election

    async def count_active(self) -> int:
        result = await self.session.execute(
            select(func.count()).select_from(Election).where(
                Election.status == ElectionStatus.active
            )
        )
        return result.scalar_one()

    async def average_participation(self) -> float:
        """Average participation % across active elections."""
        result = await self.session.execute(
            select(Election)
            .where(Election.status == ElectionStatus.active)
            .options(selectinload(Election.votes))
        )
        elections = result.scalars().all()
        if not elections:
            return 0.0
        total = sum(e.participation for e in elections)
        return round(total / len(elections), 2)

    async def votes_today(self) -> int:
        from app.models.vote import Vote
        today_start = datetime.combine(date.today(), datetime.min.time()).replace(
            tzinfo=timezone.utc
        )
        result = await self.session.execute(
            select(func.count()).select_from(Vote).where(
                Vote.voted_at >= today_start
            )
        )
        return result.scalar_one()
