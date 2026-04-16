from fastapi import APIRouter
from app.v1.routers import elections, candidates, stats, webhook, admin, internal

router = APIRouter()

# Stats must be before /{election_id} to avoid route conflict
router.include_router(stats.router, prefix="/elections/stats", tags=["stats"])
router.include_router(elections.router, prefix="/elections", tags=["elections"])
router.include_router(candidates.router, prefix="/elections", tags=["candidates"])
router.include_router(webhook.router, prefix="/webhook", tags=["webhook"])
router.include_router(admin.router, prefix="/admin", tags=["admin"])
# Endpoints internes utilisés par le vote-service (sync des votes)
router.include_router(internal.router, tags=["internal"])

api_router = router

