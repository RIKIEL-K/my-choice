import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.models.vote import Vote


class VoteRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def has_voted(self, election_id: str, voter_id: str) -> bool:
        result = await self.session.execute(
            select(Vote).where(
                Vote.election_id == str(election_id),
                Vote.voter_id == str(voter_id),
            )
        )
        return result.scalar_one_or_none() is not None

    async def cast_vote(
        self, election_id: str, voter_id: str, candidate_id: str
    ) -> Vote:
        vote = Vote(
            election_id=str(election_id),
            voter_id=str(voter_id),
            candidate_id=str(candidate_id),
        )
        self.session.add(vote)
        try:
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            raise ValueError("You have already voted in this election.")
        await self.session.refresh(vote)
        return vote

    async def _count_for_candidate(self, candidate_id: str) -> int:
        result = await self.session.execute(
            select(func.count()).select_from(Vote).where(
                Vote.candidate_id == candidate_id
            )
        )
        return result.scalar_one()
