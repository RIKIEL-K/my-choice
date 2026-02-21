from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.v1.repositories.election_repo import ElectionRepository
from app.v1.repositories.election_user_repo import ElectionUserRepository
from app.v1.services.stats_service import StatsService
from app.v1.schemas.stats import ElectionStats

router = APIRouter()


def get_stats_service(session: AsyncSession = Depends(get_async_session)) -> StatsService:
    return StatsService(
        ElectionRepository(session),
        ElectionUserRepository(session),
    )


@router.get("", response_model=ElectionStats, summary="Dashboard statistics")
async def get_stats(service: StatsService = Depends(get_stats_service)):
    """
    Return global statistics for the voting dashboard:
    - active_count: number of active elections
    - registered_voters: total users registered in the election system
    - average_participation: avg participation % across active elections
    - votes_today: total votes cast today
    """
    return await service.get_dashboard_stats()
