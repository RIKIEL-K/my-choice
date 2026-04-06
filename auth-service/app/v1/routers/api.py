from fastapi import APIRouter
from app.v1.routers import users, auth, admin

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(admin.router, prefix="/admin", tags=["admin"])

api_router = router
