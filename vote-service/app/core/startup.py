"""
Lifecycle du vote-service — gère la connexion/déconnexion de tous les services
au démarrage et à l'arrêt de l'application.

Ordre de démarrage :
  1. Base de données (MySQL async)
  2. Redis (cache)
  3. Client HTTP vers election-service
  4. RabbitMQ (consumer en background)
  5. Synchronisation initiale des votes existants
"""
import asyncio
import logging

from databases import Database

from app.core.config import settings
from app.infrastructure import redis_cache, rabbitmq, election_client

logger = logging.getLogger("vote-service.startup")

# Connexion DB via le package `databases` (pour la compatibilité avec election-service)
database = Database(settings.DATABASE_URL)


async def startup():
    """Initialise toutes les connexions et lance le consumer RabbitMQ."""
    logger.info("Vote Service — démarrage...")

    # 1. Connexion à la base de données
    await database.connect()
    logger.info("✅ Base de données connectée")

    # 2. Connexion à Redis
    await redis_cache.connect(settings.REDIS_URL)
    logger.info("✅ Redis connecté")

    # 3. Initialiser le client HTTP vers election-service
    election_client.init(settings.ELECTION_SERVICE_URL)
    logger.info("✅ Client election-service initialisé")

    # 4. Connexion à RabbitMQ + lancement du consumer en arrière-plan
    await rabbitmq.connect(settings.RABBITMQ_URL)
    asyncio.create_task(rabbitmq.start_consuming())
    logger.info("✅ RabbitMQ consumer lancé en arrière-plan")

    # 5. Synchronisation des votes existants depuis election-service
    # Exécuté en tâche de fond pour ne pas bloquer le démarrage
    asyncio.create_task(_sync_existing_votes())

    logger.info("🟢 Vote Service prêt sur le port %s", settings.SERVICE_PORT)


async def shutdown():
    """Ferme proprement toutes les connexions."""
    logger.info("🛑 Vote Service — arrêt...")

    await rabbitmq.disconnect()
    await redis_cache.disconnect()
    await election_client.close()
    await database.disconnect()

    logger.info("🔴 Vote Service arrêté")


async def _sync_existing_votes():
    """
    Synchronise les votes existants depuis election-service au démarrage.
    Permet au vote-service de rattraper les votes qui ont été émis
    avant que le consumer RabbitMQ ne soit actif.
    """
    from app.v1.services.vote_consumer import sync_votes_from_election_service

    try:
        await sync_votes_from_election_service()
        logger.info("✅ Synchronisation initiale des votes terminée")
    except Exception as e:
        # Ne pas crasher le service si la sync échoue — on recevra les nouveaux votes via RabbitMQ
        logger.warning("⚠️ Échec de la synchronisation initiale: %s", e)
