import json
import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.candidate import Candidate
from app.v1.schemas.candidate import CandidateCreate, CandidateUpdate


class CandidateRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_election(self, election_id) -> list[Candidate]:
        result = await self.session.execute(
            select(Candidate).where(Candidate.election_id == str(election_id))
        )
        return result.scalars().all()  

    async def get_by_id(self, candidate_id) -> Candidate | None:
        result = await self.session.execute(
            select(Candidate).where(Candidate.id == str(candidate_id))
        )
        return result.scalar_one_or_none()

    async def get_by_user_and_election(
        self, user_id: str, election_id: str
    ) -> Candidate | None:
        result = await self.session.execute(
            select(Candidate).where(
                Candidate.user_id == str(user_id),
                Candidate.election_id == str(election_id),
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self, election_id: str, user_id: str, data: CandidateCreate
    ) -> Candidate:
        candidate = Candidate(
            election_id=str(election_id),
            user_id=str(user_id),
            display_name=data.display_name,
            bio=data.bio,
            avatar_url=data.avatar_url,
            program=data.program,
            position=data.position,
            slogan=data.slogan,
            priorities=json.dumps(data.priorities) if data.priorities else None,
        )
        self.session.add(candidate)
        await self.session.commit()
        await self.session.refresh(candidate)
        return candidate

    async def update(self, candidate: Candidate, data: CandidateUpdate) -> Candidate:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(candidate, field, value)
        await self.session.commit()
        await self.session.refresh(candidate)
        return candidate

    async def delete(self, candidate: Candidate) -> None:
        await self.session.delete(candidate)
        await self.session.commit()

    async def vote_count(self, candidate_id: str) -> int:
        from app.models.vote import Vote
        result = await self.session.execute(
            select(func.count()).select_from(Vote).where(Vote.candidate_id == candidate_id)
        )
        return result.scalar_one()
