import uuid
import pytest
from httpx import AsyncClient
from datetime import datetime, timezone, timedelta


def make_election_payload(**kwargs):
    base = {
        "title": "Test Election",
        "description": "A test election",
        "start_date": datetime.now(timezone.utc).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "total_voters": 100,
        "status": "draft",
    }
    base.update(kwargs)
    return base


class TestElectionEndpoints:
    async def test_list_elections_empty(self, client: AsyncClient):
        response = await client.get("/api/v1/elections")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["items"] == []

    async def test_create_election(self, client: AsyncClient):
        payload = make_election_payload()
        response = await client.post("/api/v1/elections", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == payload["title"]
        assert data["status"] == "draft"
        assert data["vote_count"] == 0
        assert data["participation"] == 0.0

    async def test_get_election_not_found(self, client: AsyncClient):
        response = await client.get(f"/api/v1/elections/{uuid.uuid4()}")
        assert response.status_code == 404

    async def test_get_election(self, client: AsyncClient):
        payload = make_election_payload()
        create_resp = await client.post("/api/v1/elections", json=payload)
        election_id = create_resp.json()["id"]

        response = await client.get(f"/api/v1/elections/{election_id}")
        assert response.status_code == 200
        assert response.json()["id"] == election_id

    async def test_filter_by_status(self, client: AsyncClient):
        await client.post("/api/v1/elections", json=make_election_payload(status="draft"))
        await client.post("/api/v1/elections", json=make_election_payload(status="active"))

        active_resp = await client.get("/api/v1/elections?status=active")
        assert active_resp.json()["total"] == 1
        assert active_resp.json()["items"][0]["status"] == "active"

    async def test_update_election(self, client: AsyncClient):
        create_resp = await client.post(
            "/api/v1/elections", json=make_election_payload()
        )
        election_id = create_resp.json()["id"]

        update_resp = await client.patch(
            f"/api/v1/elections/{election_id}",
            json={"status": "active"},
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["status"] == "active"
