"""
Application FastAPI v1 pour le vote-service.
Monte sous /api/v1 dans le main.py.
"""
from fastapi import FastAPI
from app.v1.routers import api as api_router
from app.core.config import settings

v1_app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Vote microservice API v1 — résultats en temps réel",
    version="1.0.0",
)

v1_app.include_router(api_router.api_router)
