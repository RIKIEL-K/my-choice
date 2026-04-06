"""
Admin router — election-service admin-only endpoints.
All routes under /admin/... 
TODO: add admin JWT auth dependency when auth is wired up.
"""
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.models.candidate import ApprovalStatus
from app.models.election import ElectionStatus
from app.v1.repositories.election_repository import ElectionRepository
from app.v1.repositories.candidate_repository import CandidateRepository
from app.v1.repositories.election_user_repository import ElectionUserRepository
from app.v1.repositories.vote_repository import VoteRepository
from app.v1.services.election_service import ElectionService
from app.v1.services.admin_service import AdminService
from app.v1.schemas.stats import AdminDashboardStats
from app.v1.schemas.election import (
    ElectionCreate,
    ElectionUpdate,
    ElectionListResponse,
    ElectionRead,
)
from app.v1.schemas.candidate import CandidateRead, CandidateUpdate

router = APIRouter()


def get_admin_service(session: AsyncSession = Depends(get_async_session)) -> AdminService:
    return AdminService(session)


def get_election_service(session: AsyncSession = Depends(get_async_session)) -> ElectionService:
    return ElectionService(
        ElectionRepository(session),
        CandidateRepository(session),
        VoteRepository(session),
    )


# ─── Dashboard stats ─────────────────────────────────────────────────────────

@router.get("/stats", response_model=AdminDashboardStats, summary="Admin dashboard stats")
async def admin_dashboard_stats(
    service: AdminService = Depends(get_admin_service),
):
    """Return all data needed for the admin dashboard (KPIs, charts, activity, alerts)."""
    return await service.get_admin_dashboard_stats()


# ─── Elections (full CRUD, all statuses) ─────────────────────────────────────

@router.get(
    "/elections",
    response_model=ElectionListResponse,
    summary="Admin: list all elections",
)
async def admin_list_elections(
    status_filter: ElectionStatus | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    service: ElectionService = Depends(get_election_service),
):
    """Return all elections regardless of status (admin view)."""
    return await service.list_elections(status=status_filter, page=page, size=size)


@router.post(
    "/elections",
    response_model=ElectionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Admin: create election",
)
async def admin_create_election(
    data: ElectionCreate,
    service: ElectionService = Depends(get_election_service),
):
    return await service.create_election(data)


@router.patch(
    "/elections/{election_id}",
    response_model=ElectionRead,
    summary="Admin: update election",
)
async def admin_update_election(
    election_id: uuid.UUID,
    data: ElectionUpdate,
    service: ElectionService = Depends(get_election_service),
):
    return await service.update_election(str(election_id), data)


@router.delete(
    "/elections/{election_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Admin: delete election",
)
async def admin_delete_election(
    election_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
):
    repo = ElectionRepository(session)
    election = await repo.get_by_id(str(election_id))
    if election:
        await session.delete(election)
        await session.commit()


# ─── Candidates (global list, approve/reject/delete) ─────────────────────────

@router.get(
    "/candidates",
    response_model=list[CandidateRead],
    summary="Admin: list all candidates",
)
async def admin_list_candidates(
    election_id: str | None = Query(None, description="Filter by election"),
    approval_status: ApprovalStatus | None = Query(None, description="Filter by approval"),
    session: AsyncSession = Depends(get_async_session),
):
    """Return all candidates across all elections with optional filters."""
    from sqlalchemy import select
    from app.models.candidate import Candidate
    from app.v1.repositories.candidate_repository import CandidateRepository
    from app.v1.repositories.vote_repository import VoteRepository
    from app.v1.services.election_service import _candidate_to_read

    query = select(Candidate)
    if election_id:
        query = query.where(Candidate.election_id == election_id)
    if approval_status:
        query = query.where(Candidate.approval_status == approval_status)
    query = query.order_by(Candidate.created_at.desc())

    result = await session.execute(query)
    candidates = result.scalars().all()

    vote_repo = VoteRepository(session)
    out = []
    for c in candidates:
        vc = await vote_repo._count_for_candidate(c.id)
        out.append(_candidate_to_read(c, vc))
    return out


@router.patch(
    "/candidates/{candidate_id}/approve",
    response_model=CandidateRead,
    summary="Admin: approve candidate",
)
async def admin_approve_candidate(
    candidate_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
):
    from app.models.candidate import Candidate
    from sqlalchemy import select
    from app.v1.services.election_service import _candidate_to_read
    from app.v1.repositories.vote_repository import VoteRepository

    result = await session.execute(
        select(Candidate).where(Candidate.id == str(candidate_id))
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Candidate not found")
    candidate.approval_status = ApprovalStatus.approved
    await session.commit()
    await session.refresh(candidate)
    vote_repo = VoteRepository(session)
    vc = await vote_repo._count_for_candidate(candidate.id)
    return _candidate_to_read(candidate, vc)


@router.patch(
    "/candidates/{candidate_id}/reject",
    response_model=CandidateRead,
    summary="Admin: reject candidate",
)
async def admin_reject_candidate(
    candidate_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
):
    from app.models.candidate import Candidate
    from sqlalchemy import select
    from app.v1.services.election_service import _candidate_to_read
    from app.v1.repositories.vote_repository import VoteRepository

    result = await session.execute(
        select(Candidate).where(Candidate.id == str(candidate_id))
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Candidate not found")
    candidate.approval_status = ApprovalStatus.rejected
    await session.commit()
    await session.refresh(candidate)
    vote_repo = VoteRepository(session)
    vc = await vote_repo._count_for_candidate(candidate.id)
    return _candidate_to_read(candidate, vc)


@router.delete(
    "/candidates/{candidate_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Admin: delete candidate",
)
async def admin_delete_candidate(
    candidate_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
):
    from app.models.candidate import Candidate
    from sqlalchemy import select

    result = await session.execute(
        select(Candidate).where(Candidate.id == str(candidate_id))
    )
    candidate = result.scalar_one_or_none()
    if candidate:
        await session.delete(candidate)
        await session.commit()
