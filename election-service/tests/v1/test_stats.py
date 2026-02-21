import pytest
from httpx import AsyncClient


class TestStatsEndpoint:
    async def test_stats_empty(self, client: AsyncClient):
        """Stats return zeros when database is empty."""
        response = await client.get("/api/v1/elections/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["active_count"] == 0
        assert data["registered_voters"] == 0
        assert data["average_participation"] == 0.0
        assert data["votes_today"] == 0

    async def test_stats_with_active_election(self, client: AsyncClient):
        from datetime import datetime, timezone, timedelta
        payload = {
            "title": "Active Election",
            "description": "desc",
            "start_date": datetime.now(timezone.utc).isoformat(),
            "end_date": (datetime.now(timezone.utc) + timedelta(days=5)).isoformat(),
            "total_voters": 200,
            "status": "active",
        }
        await client.post("/api/v1/elections", json=payload)

        response = await client.get("/api/v1/elections/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["active_count"] == 1
        assert data["average_participation"] == 0.0  # no votes yet
