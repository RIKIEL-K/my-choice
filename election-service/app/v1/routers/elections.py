import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.models.election import ElectionStatus
from app.v1.repositories.election_repository import ElectionRepository
from app.v1.repositories.candidate_repository import CandidateRepository
from app.v1.repositories.vote_repository import VoteRepository
from app.v1.services.election_service import ElectionService
from app.v1.schemas.election import (
    ElectionCreate,
    ElectionUpdate,
    ElectionListResponse,
    ElectionRead,
)
from app.v1.schemas.webhook import VoteCreate

router = APIRouter()


def get_election_service(session: AsyncSession = Depends(get_async_session)) -> ElectionService:
    return ElectionService(
        ElectionRepository(session),
        CandidateRepository(session),
        VoteRepository(session),
    )


@router.get("", response_model=ElectionListResponse, summary="List elections")
async def list_elections(
    status_filter: ElectionStatus | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    service: ElectionService = Depends(get_election_service),
):
    """
    Return a paginated list of elections.
    Filter by status: `draft`, `active`, or `closed`.
    """
    return await service.list_elections(status=status_filter, page=page, size=size)


@router.get("/{election_id}", response_model=ElectionRead, summary="Get election detail")
async def get_election(
    election_id: uuid.UUID,
    service: ElectionService = Depends(get_election_service),
):
    """Return a single election with its candidates and vote counts."""
    return await service.get_election(election_id)


@router.post("", response_model=ElectionRead, status_code=status.HTTP_201_CREATED,
             summary="Create election")
async def create_election(
    data: ElectionCreate,
    # TODO: replace with real admin auth dependency
    created_by: uuid.UUID | None = None,
    service: ElectionService = Depends(get_election_service),
):
    """Create a new election (admin only)."""
    return await service.create_election(data, created_by=created_by)


@router.patch("/{election_id}", response_model=ElectionRead, summary="Update election")
async def update_election(
    election_id: uuid.UUID,
    data: ElectionUpdate,
    service: ElectionService = Depends(get_election_service),
):
    """Update election fields (title, description, dates, status, total_voters)."""
    return await service.update_election(election_id, data)


@router.post(
    "/{election_id}/vote",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cast a vote",
)
async def cast_vote(
    election_id: uuid.UUID,
    payload: VoteCreate,
    # TODO: replace with real voter user_id from JWT
    voter_id: uuid.UUID = Query(..., description="voter user_id (from auth JWT)"),
    service: ElectionService = Depends(get_election_service),
):
    """Cast a vote for a candidate. One vote per user per election."""
    await service.cast_vote(election_id, voter_id, payload.candidate_id)
