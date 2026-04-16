import logging

from databases import Database

from app.core.config import settings
from app.infrastructure import rabbitmq_publisher

logger = logging.getLogger("election-service.startup")

database = Database(settings.DATABASE_URL)


async def startup():
    await database.connect()
    # Connexion au broker RabbitMQ pour publier les événements de vote
    # Si RabbitMQ n'est pas disponible, le service fonctionne quand même
    # (les votes sont persistés en DB, mais pas transmis au vote-service)
    await rabbitmq_publisher.connect(settings.RABBITMQ_URL)
    logger.info("Election Service démarré")


async def shutdown():
    await rabbitmq_publisher.disconnect()
    await database.disconnect()
