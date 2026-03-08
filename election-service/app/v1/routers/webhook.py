import hmac
import hashlib
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_async_session
from app.v1.repositories.election_user_repository import ElectionUserRepository
from app.v1.schemas.webhook import UserCreatedPayload

router = APIRouter()


def _verify_signature(payload_body: bytes, signature: str) -> bool:
    """Verify HMAC-SHA256 signature from auth-service."""
    expected = hmac.new(
        settings.AUTH_SERVICE_WEBHOOK_SECRET.encode(),
        payload_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)


@router.post(
    "/user-created",
    status_code=status.HTTP_201_CREATED,
    summary="Webhook: user created in auth-service",
)
async def user_created_webhook(
    payload: UserCreatedPayload,
    session: AsyncSession = Depends(get_async_session),
    x_webhook_secret: str = Header(default=""),
):
    """
    Called by auth-service when a new user registers.
    Creates an empty ElectionUser profile with the same user_id.
    """
    # Simple shared-secret check (lightweight, no HMAC overhead in dev)
    if x_webhook_secret != settings.AUTH_SERVICE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook secret.",
        )

    repo = ElectionUserRepository(session)

    # Idempotent: if profile already exists, do nothing
    existing = await repo.get_by_user_id(payload.user_id)
    if existing:
        return {"status": "already_exists", "user_id": str(payload.user_id)}

    display_name = payload.display_name or payload.email.split("@")[0]
    await repo.create(user_id=payload.user_id, display_name=display_name)
    return {"status": "created", "user_id": str(payload.user_id)}
