from app.v1.repositories.election_repository import ElectionRepository
from app.v1.repositories.election_user_repository import ElectionUserRepository
from app.v1.schemas.stats import ElectionStats


class StatsService:
    def __init__(
        self,
        election_repo: ElectionRepository,
        user_repo: ElectionUserRepository,
    ):
        self.election_repo = election_repo
        self.user_repo = user_repo

    async def get_dashboard_stats(self) -> ElectionStats:
        active_count = await self.election_repo.count_active()
        registered_voters = await self.user_repo.count_all()
        average_participation = await self.election_repo.average_participation()
        votes_today = await self.election_repo.votes_today()

        return ElectionStats(
            active_count=active_count,
            registered_voters=registered_voters,
            average_participation=average_participation,
            votes_today=votes_today,
        )
