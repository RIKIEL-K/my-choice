"""
Configuration du vote-service.

Charge les variables d'env depuis .env (dev) ou .env.{ENV} (test, ci).
"""
import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

env = os.getenv("ENV", "dev")
if env == "dev":
    dotenv_path = ".env"
else:
    dotenv_path = f".env.{env}"
load_dotenv(dotenv_path=dotenv_path, override=False)


class Settings(BaseSettings):
    PROJECT_NAME: str = "Vote Service"

    # Base de données propre au vote-service
    DATABASE_URL: str = "mysql+aiomysql://root:@localhost:3306/vote_service"

    # RabbitMQ — broker de messages pour les événements de vote
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"

    # Redis — cache des calculs lourds (classements, tendances, participation)
    REDIS_URL: str = "redis://localhost:6379/0"

    # URL de l'API election-service — pour récupérer les métadonnées (elections, candidats)
    ELECTION_SERVICE_URL: str = "http://localhost:8001/api/v1"

    # Frontend URL (pour CORS)
    FRONTEND_URL: str = "http://127.0.0.1:5173"

    # Port de ce service
    SERVICE_PORT: int = 8002


settings = Settings()
