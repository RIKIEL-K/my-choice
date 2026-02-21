from fastapi import APIRouter
from app.v1.routers import elections, candidates, stats, webhook

router = APIRouter()

# Stats must be before /{election_id} to avoid route conflict
router.include_router(stats.router, prefix="/elections/stats", tags=["stats"])
router.include_router(elections.router, prefix="/elections", tags=["elections"])
router.include_router(candidates.router, prefix="/elections", tags=["candidates"])
router.include_router(webhook.router, prefix="/webhook", tags=["webhook"])

api_router = router
