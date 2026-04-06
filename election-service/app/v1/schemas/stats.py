from pydantic import BaseModel
from typing import List


class ElectionStats(BaseModel):
    """Dashboard statistics returned to the VotingDashboard frontend."""
    active_count: int
    registered_voters: int          # Total rows in election_users
    average_participation: float    # Avg participation % across active elections
    votes_today: int                # Votes cast today across all elections


class DashboardStat(BaseModel):
    """Single stat card data for the frontend."""
    title: str
    value: str
    change: str
    color: str


class VotesByHour(BaseModel):
    """Votes count aggregated by hour of day (for area chart)."""
    heure: str   # e.g. "08h"
    votes: int


class ElectionParticipation(BaseModel):
    """Per-election participation data for bar chart."""
    election: str
    participation: float


class RecentActivity(BaseModel):
    """A recent activity log entry."""
    action: str
    detail: str
    time: str
    type: str   # vote | candidate | election | student | report


class AdminAlert(BaseModel):
    """An alert shown at the top of the admin dashboard."""
    text: str
    severity: str   # warning | info
    action: str
    target: str     # page to navigate to


class AdminDashboardStats(BaseModel):
    """Full admin dashboard data — aggregated from election-service DB."""
    # KPI cards
    total_elections: int
    active_elections: int
    total_votes: int
    votes_today: int
    registered_voters: int
    average_participation: float
    # Charts
    votes_by_hour: List[VotesByHour]
    elections_participation: List[ElectionParticipation]
    # Activity & alerts
    recent_activity: List[RecentActivity]
    alerts: List[AdminAlert]
