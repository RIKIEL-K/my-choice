import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.v1.repositories.election_repo import ElectionRepository
from app.v1.repositories.candidate_repo import CandidateRepository
from app.v1.repositories.vote_repo import VoteRepository
from app.v1.services.election_service import ElectionService
from app.v1.schemas.candidate import CandidateCreate, CandidateRead, CandidateUpdate

router = APIRouter()


def get_election_service(session: AsyncSession = Depends(get_async_session)) -> ElectionService:
    return ElectionService(
        ElectionRepository(session),
        CandidateRepository(session),
        VoteRepository(session),
    )


@router.get(
    "/{election_id}/candidates",
    response_model=list[CandidateRead],
    summary="List candidates",
)
async def list_candidates(
    election_id: uuid.UUID,
    service: ElectionService = Depends(get_election_service),
):
    """Return all candidates registered for an election, with vote counts."""
    from app.v1.repositories.candidate_repo import CandidateRepository
    from app.db.session import get_async_session
    from app.v1.services.election_service import _candidate_to_read
    election_read = await service.get_election(election_id)
    return election_read.candidates


@router.post(
    "/{election_id}/candidates",
    response_model=CandidateRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register as candidate",
)
async def register_candidate(
    election_id: uuid.UUID,
    data: CandidateCreate,
    # TODO: replace with real user_id from JWT
    user_id: uuid.UUID = ...,  # type: ignore
    service: ElectionService = Depends(get_election_service),
):
    """Register the authenticated user as a candidate in this election."""
    return await service.add_candidate(election_id, user_id, data)


@router.delete(
    "/{election_id}/candidates/{candidate_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Withdraw candidacy",
)
async def withdraw_candidacy(
    election_id: uuid.UUID,
    candidate_id: uuid.UUID,
    # TODO: replace with real user_id from JWT
    user_id: uuid.UUID = ...,  # type: ignore
    service: ElectionService = Depends(get_election_service),
):
    """Remove the authenticated user's candidacy from this election."""
    await service.remove_candidate(election_id, candidate_id, user_id)
