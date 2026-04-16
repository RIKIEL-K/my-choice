from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

env = os.getenv("ENV", "dev")
if env == "dev":
    dotenv_path = ".env"
else:
    dotenv_path = f".env.{env}"
load_dotenv(dotenv_path=dotenv_path, override=False)


class Settings(BaseSettings):
    PROJECT_NAME: str = "Election Service"
    DATABASE_URL: str = "mysql+aiomysql://root:@localhost:3306/election_service"
    FRONTEND_URL: str = "http://127.0.0.1:5173"
    # Secret shared between auth-service and election-service for webhook calls
    AUTH_SERVICE_WEBHOOK_SECRET: str = "dev-secret"
    # RabbitMQ — publication des événements de vote vers le vote-service
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"
    # Port of this service
    SERVICE_PORT: int = 8001


print("Loading environment variables...")
print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")
settings = Settings()
