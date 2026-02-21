import uuid
import pytest
from httpx import AsyncClient

from app.core.config import settings

WEBHOOK_SECRET = settings.AUTH_SERVICE_WEBHOOK_SECRET


class TestWebhook:
    async def test_user_created_success(self, client: AsyncClient):
        user_id = str(uuid.uuid4())
        response = await client.post(
            "/api/v1/webhook/user-created",
            json={"user_id": user_id, "email": "test@example.com"},
            headers={"x-webhook-secret": WEBHOOK_SECRET},
        )
        assert response.status_code == 201
        assert response.json()["status"] == "created"
        assert response.json()["user_id"] == user_id

    async def test_user_created_idempotent(self, client: AsyncClient):
        """Calling the webhook twice for the same user should return already_exists."""
        user_id = str(uuid.uuid4())
        payload = {"user_id": user_id, "email": "twice@example.com"}
        headers = {"x-webhook-secret": WEBHOOK_SECRET}

        await client.post("/api/v1/webhook/user-created", json=payload, headers=headers)
        response = await client.post(
            "/api/v1/webhook/user-created", json=payload, headers=headers
        )
        assert response.status_code == 201
        assert response.json()["status"] == "already_exists"

    async def test_user_created_invalid_secret(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/webhook/user-created",
            json={"user_id": str(uuid.uuid4()), "email": "hack@example.com"},
            headers={"x-webhook-secret": "wrong-secret"},
        )
        assert response.status_code == 401

    async def test_stats_registered_voters_increases(self, client: AsyncClient):
        """After webhook, registered_voters count should increase."""
        stats_before = (await client.get("/api/v1/elections/stats")).json()
        initial_count = stats_before["registered_voters"]

        await client.post(
            "/api/v1/webhook/user-created",
            json={"user_id": str(uuid.uuid4()), "email": "new@example.com"},
            headers={"x-webhook-secret": WEBHOOK_SECRET},
        )

        stats_after = (await client.get("/api/v1/elections/stats")).json()
        assert stats_after["registered_voters"] == initial_count + 1
