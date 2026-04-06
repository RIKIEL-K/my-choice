"""
Admin router — auth-service user management and platform settings.
TODO: protect with admin JWT dependency.
"""
import csv
import io
from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.v1.repositories.user_repository import UserRepository
from app.v1.schemas.admin import (
    UserAdminRead,
    AdminUserListResponse,
    UserStatusUpdate,
    PlatformSettings,
    PlatformSettingsUpdate,
)

router = APIRouter()

# In-memory platform settings store (replace with DB if needed)
_platform_settings = PlatformSettings()


def get_user_repo(session: AsyncSession = Depends(get_async_session)) -> UserRepository:
    return UserRepository(session)


# ─── Users Management ────────────────────────────────────────────────────────

@router.get(
    "/users",
    response_model=AdminUserListResponse,
    summary="Admin: list all users",
)
async def admin_list_users(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    search: str | None = Query(None, description="Search by email"),
    status: str | None = Query(None, description="Filter: active|suspended|pending"),
    repo: UserRepository = Depends(get_user_repo),
):
    users, total = await repo.get_all(
        page=page, size=size, search=search, status_filter=status
    )
    counts = await repo.count_by_status()
    return AdminUserListResponse(
        items=[UserAdminRead.model_validate(u) for u in users],
        total=total,
        page=page,
        size=size,
        counts=counts,
    )


@router.patch(
    "/users/{user_id}/status",
    response_model=UserAdminRead,
    summary="Admin: change user status",
)
async def admin_update_user_status(
    user_id: str,
    payload: UserStatusUpdate,
    repo: UserRepository = Depends(get_user_repo),
):
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.action == "suspend":
        updated = await repo.set_active(user, is_active=False)
    elif payload.action in ("activate", "validate"):
        updated = await repo.set_active(user, is_active=True)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown action: {payload.action}")

    return UserAdminRead.model_validate(updated)


@router.get(
    "/users/export",
    summary="Admin: export users as CSV",
)
async def admin_export_users_csv(
    repo: UserRepository = Depends(get_user_repo),
):
    users, _ = await repo.get_all(page=1, size=10000)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Email", "Role", "Active", "Verified", "Locked"])
    for u in users:
        writer.writerow([
            str(u.id),
            u.email,
            u.role,
            u.is_active,
            u.is_verified,
            u.is_locked,
        ])
    output.seek(0)

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users_export.csv"},
    )


# ─── Platform Settings ────────────────────────────────────────────────────────

@router.get(
    "/settings",
    response_model=PlatformSettings,
    summary="Admin: get platform settings",
)
async def get_platform_settings():
    return _platform_settings


@router.patch(
    "/settings",
    response_model=PlatformSettings,
    summary="Admin: update platform settings",
)
async def update_platform_settings(payload: PlatformSettingsUpdate):
    global _platform_settings
    updated = _platform_settings.model_copy(
        update={k: v for k, v in payload.model_dump().items() if v is not None}
    )
    _platform_settings = updated
    return _platform_settings
