"""
Admin service — aggregates real data from DB for the admin dashboard.
"""
from datetime import date, datetime, timedelta, timezone
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.election import Election, ElectionStatus
from app.models.candidate import Candidate, ApprovalStatus
from app.models.vote import Vote
from app.models.election_user import ElectionUser
from app.v1.schemas.stats import (
    AdminDashboardStats,
    VotesByHour,
    ElectionParticipation,
    RecentActivity,
    AdminAlert,
)


class AdminService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_admin_dashboard_stats(self) -> AdminDashboardStats:
        now = datetime.now(timezone.utc)
        today_start = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)

        # --- KPI counts ---
        total_elections = (await self.session.execute(
            select(func.count()).select_from(Election)
        )).scalar_one()

        active_elections = (await self.session.execute(
            select(func.count()).select_from(Election).where(
                Election.status == ElectionStatus.active
            )
        )).scalar_one()

        total_votes = (await self.session.execute(
            select(func.count()).select_from(Vote)
        )).scalar_one()

        votes_today = (await self.session.execute(
            select(func.count()).select_from(Vote).where(Vote.voted_at >= today_start)
        )).scalar_one()

        registered_voters = (await self.session.execute(
            select(func.count()).select_from(ElectionUser)
        )).scalar_one()

        # Average participation across active elections
        active_elections_rows = (await self.session.execute(
            select(Election).where(Election.status == ElectionStatus.active)
            .options(selectinload(Election.votes))
        )).scalars().all()

        if active_elections_rows:
            average_participation = round(
                sum(e.participation for e in active_elections_rows) / len(active_elections_rows), 2
            )
        else:
            average_participation = 0.0

        # --- Votes by hour (today, from 06h to 22h) ---
        votes_by_hour = await self._votes_by_hour(today_start)

        # --- Elections participation list ---
        all_elections = (await self.session.execute(
            select(Election).options(selectinload(Election.votes))
        )).scalars().all()

        elections_participation = [
            ElectionParticipation(
                election=e.title[:20],
                participation=e.participation,
            )
            for e in all_elections
        ]

        # --- Recent activity (last 20 votes / candidates / elections) ---
        recent_activity = await self._recent_activity()

        # --- Alerts ---
        alerts = await self._build_alerts()

        return AdminDashboardStats(
            total_elections=total_elections,
            active_elections=active_elections,
            total_votes=total_votes,
            votes_today=votes_today,
            registered_voters=registered_voters,
            average_participation=average_participation,
            votes_by_hour=votes_by_hour,
            elections_participation=elections_participation,
            recent_activity=recent_activity,
            alerts=alerts,
        )

    async def _votes_by_hour(self, today_start: datetime) -> list[VotesByHour]:
        """Group today's votes by hour."""
        result = []
        for hour in range(6, 23):
            hour_start = today_start + timedelta(hours=hour)
            hour_end = hour_start + timedelta(hours=1)
            count = (await self.session.execute(
                select(func.count()).select_from(Vote).where(
                    and_(Vote.voted_at >= hour_start, Vote.voted_at < hour_end)
                )
            )).scalar_one()
            result.append(VotesByHour(heure=f"{hour:02d}h", votes=count))
        return result

    async def _recent_activity(self) -> list[RecentActivity]:
        """Build a unified recent activity feed from votes, candidates, elections."""
        activities: list[RecentActivity] = []

        # Recent votes
        recent_votes = (await self.session.execute(
            select(Vote, Election)
            .join(Election, Vote.election_id == Election.id)
            .order_by(Vote.voted_at.desc())
            .limit(5)
        )).all()
        for vote, election in recent_votes:
            ago = self._human_time(vote.voted_at)
            activities.append(RecentActivity(
                action="Nouveau vote enregistré",
                detail=election.title,
                time=ago,
                type="vote",
            ))

        # Recent candidates submitted
        recent_candidates = (await self.session.execute(
            select(Candidate, Election)
            .join(Election, Candidate.election_id == Election.id)
            .order_by(Candidate.created_at.desc())
            .limit(5)
        )).all()
        for cand, election in recent_candidates:
            ago = self._human_time(cand.created_at)
            activities.append(RecentActivity(
                action="Candidature soumise",
                detail=f"{cand.display_name} — {cand.position or election.title}",
                time=ago,
                type="candidate",
            ))

        # Recent elections created/updated
        recent_elections = (await self.session.execute(
            select(Election).order_by(Election.created_at.desc()).limit(3)
        )).scalars().all()
        for elec in recent_elections:
            ago = self._human_time(elec.created_at)
            activities.append(RecentActivity(
                action=f"Élection {elec.status.value}",
                detail=elec.title,
                time=ago,
                type="election",
            ))

        # Sort all by recency approximation (we just use created_at as proxy)
        activities.sort(key=lambda x: x.time)
        return activities[:10]

    async def _build_alerts(self) -> list[AdminAlert]:
        alerts: list[AdminAlert] = []

        # Pending candidates
        pending_count = (await self.session.execute(
            select(func.count()).select_from(Candidate).where(
                Candidate.approval_status == ApprovalStatus.pending
            )
        )).scalar_one()
        if pending_count > 0:
            alerts.append(AdminAlert(
                text=f"{pending_count} candidature(s) en attente de validation",
                severity="warning",
                action="Valider",
                target="candidates",
            ))

        # Unscheduled elections (draft with no dates)
        draft_count = (await self.session.execute(
            select(func.count()).select_from(Election).where(
                Election.status == ElectionStatus.draft
            )
        )).scalar_one()
        if draft_count > 0:
            alerts.append(AdminAlert(
                text=f"{draft_count} élection(s) en brouillon non encore programmée(s)",
                severity="info",
                action="Programmer",
                target="elections",
            ))

        return alerts

    @staticmethod
    def _human_time(dt: datetime) -> str:
        """Returns a human-readable relative time string."""
        now = datetime.now(timezone.utc)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        diff = now - dt
        seconds = int(diff.total_seconds())
        if seconds < 60:
            return f"il y a {seconds}s"
        minutes = seconds // 60
        if minutes < 60:
            return f"il y a {minutes} min"
        hours = minutes // 60
        if hours < 24:
            return f"il y a {hours}h"
        days = hours // 24
        return f"il y a {days}j"
