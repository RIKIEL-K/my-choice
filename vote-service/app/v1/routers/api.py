"""
Registre des routes API v1 du vote-service.

Expose uniquement le router des résultats — c'est la seule responsabilité
de ce microservice.
"""
from fastapi import APIRouter
from app.v1.routers import results

router = APIRouter()

router.include_router(results.router, prefix="/elections", tags=["results"])

api_router = router
