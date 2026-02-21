from pydantic import BaseModel


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
