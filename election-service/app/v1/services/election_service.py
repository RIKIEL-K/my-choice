import uuid
from fastapi import HTTPException, status

from app.models.election import Election, ElectionStatus
from app.models.candidate import Candidate
from app.v1.repositories.election_repo import ElectionRepository
from app.v1.repositories.candidate_repo import CandidateRepository
from app.v1.repositories.vote_repo import VoteRepository
from app.v1.schemas.election import ElectionCreate, ElectionUpdate, ElectionListResponse, ElectionRead
from app.v1.schemas.candidate import CandidateCreate, CandidateRead


def _candidate_to_read(c: Candidate, vote_count: int = 0) -> CandidateRead:
    return CandidateRead(
        id=c.id,
        election_id=c.election_id,
        user_id=c.user_id,
        display_name=c.display_name,
        bio=c.bio,
        avatar_url=c.avatar_url,
        vote_count=vote_count,
        created_at=c.created_at,
    )


def _election_to_read(election: Election) -> ElectionRead:
    # Build vote count per candidate
    vote_counts: dict[str, int] = {}
    for v in election.votes:
        vote_counts[v.candidate_id] = vote_counts.get(v.candidate_id, 0) + 1

    candidates = [
        _candidate_to_read(c, vote_counts.get(c.id, 0))
        for c in election.candidates
    ]
    return ElectionRead(
        id=election.id,
        title=election.title,
        description=election.description,
        start_date=election.start_date,
        end_date=election.end_date,
        status=election.status,
        total_voters=election.total_voters,
        vote_count=election.vote_count,
        participation=election.participation,
        candidates=candidates,
        created_at=election.created_at,
    )


class ElectionService:
    def __init__(
        self,
        election_repo: ElectionRepository,
        candidate_repo: CandidateRepository,
        vote_repo: VoteRepository,
    ):
        self.election_repo = election_repo
        self.candidate_repo = candidate_repo
        self.vote_repo = vote_repo

    async def list_elections(
        self,
        status: ElectionStatus | None = None,
        page: int = 1,
        size: int = 20,
    ) -> ElectionListResponse:
        elections, total = await self.election_repo.get_all(status=status, page=page, size=size)
        return ElectionListResponse(
            items=[_election_to_read(e) for e in elections],
            total=total,
            page=page,
            size=size,
        )

    async def get_election(self, election_id: str) -> ElectionRead:
        election = await self.election_repo.get_by_id(election_id)
        if not election:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Election not found")
        return _election_to_read(election)

    async def create_election(
        self, data: ElectionCreate, created_by: str | None = None
    ) -> ElectionRead:
        election = await self.election_repo.create(data, created_by=created_by)
        return _election_to_read(election)

    async def update_election(
        self, election_id: str, data: ElectionUpdate
    ) -> ElectionRead:
        election = await self.election_repo.get_by_id(election_id)
        if not election:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Election not found")
        updated = await self.election_repo.update(election, data)
        return _election_to_read(updated)

    async def add_candidate(
        self, election_id: str, user_id: str, data: CandidateCreate
    ) -> CandidateRead:
        election = await self.election_repo.get_by_id(election_id)
        if not election:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Election not found")
        if election.status != ElectionStatus.draft:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Candidates can only be added to elections in draft status.",
            )
        existing = await self.candidate_repo.get_by_user_and_election(user_id, election_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You are already registered as a candidate in this election.",
            )
        candidate = await self.candidate_repo.create(election_id, user_id, data)
        vote_count = await self.candidate_repo.vote_count(candidate.id)
        return _candidate_to_read(candidate, vote_count)

    async def remove_candidate(
        self, election_id: str, candidate_id: str, user_id: str
    ) -> None:
        candidate = await self.candidate_repo.get_by_id(candidate_id)
        if not candidate or candidate.election_id != election_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
        if candidate.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your candidacy")
        await self.candidate_repo.delete(candidate)

    async def cast_vote(
        self, election_id: str, voter_id: str, candidate_id: str
    ) -> None:
        election = await self.election_repo.get_by_id(election_id)
        if not election:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Election not found")
        if election.status != ElectionStatus.active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Election is not active."
            )
        try:
            await self.vote_repo.cast_vote(election_id, voter_id, candidate_id)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
