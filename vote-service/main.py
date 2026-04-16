"""
Vote Service — Point d'entrée principal.

Microservice dédié au traitement des votes en temps réel :
  • Consomme les événements de vote via RabbitMQ (à son propre rythme)
  • Cache les résultats lourds dans Redis (classements, tendances, participation)
  • Expose une API REST + SSE pour les résultats en direct
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.startup import startup, shutdown
from app.v1.app import v1_app


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle : démarre et arrête les connexions aux services externes."""
    await startup()
    yield
    await shutdown()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Vote microservice — real-time election results via RabbitMQ + Redis + SSE.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — autorise le frontend à se connecter (y compris SSE via EventSource)
origins = [settings.FRONTEND_URL]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Welcome to the Vote Service!"}


@app.get("/up")
def health_check():
    """Health check — utilisé par les orchestrateurs et le Makefile."""
    return {"message": "up"}


app.mount("/api/v1", v1_app)
