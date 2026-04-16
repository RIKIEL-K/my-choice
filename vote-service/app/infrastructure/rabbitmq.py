"""
RabbitMQ Consumer — consomme les événements de vote à son propre rythme.

Architecture :
  • election-service publie un message à chaque vote (fire-and-forget)
  • Ce consumer lit la queue 'votes' avec prefetch_count=1
    → un seul message traité à la fois, sans pression sur le service
  • Chaque message est acquitté (ack) seulement après traitement complet
  • Si le traitement échoue, le message est rejeté (nack) et remis dans la queue

Format du message :
  {
    "event": "vote_cast",
    "election_id": "uuid",
    "voter_id": "uuid",
    "candidate_id": "uuid",
    "voted_at": "ISO-8601"
  }
"""
import json
import logging

import aio_pika
from aio_pika import IncomingMessage

logger = logging.getLogger("vote-service.rabbitmq")

# Queue durable — les messages survivent au redémarrage de RabbitMQ
QUEUE_NAME = "votes"

# État du module (initialisé au startup)
_connection: aio_pika.abc.AbstractRobustConnection | None = None
_channel: aio_pika.abc.AbstractChannel | None = None


async def connect(rabbitmq_url: str) -> None:
    """
    Établit la connexion à RabbitMQ avec reconnection automatique.
    Appelé au startup du service.
    """
    global _connection, _channel

    # RobustConnection gère automatiquement les reconnexions si le broker redémarre
    _connection = await aio_pika.connect_robust(rabbitmq_url)
    _channel = await _connection.channel()

    # prefetch_count=1 : le consumer ne traite qu'un message à la fois
    # → aucune pression sur le service, il consomme à son rythme
    await _channel.set_qos(prefetch_count=1)

    # Déclare la queue (idempotent — la crée si elle n'existe pas)
    await _channel.declare_queue(QUEUE_NAME, durable=True)

    logger.info("Connecté à RabbitMQ — queue '%s' prête", QUEUE_NAME)


async def start_consuming() -> None:
    """
    Lance la boucle de consommation en arrière-plan.
    Chaque message est traité par _on_message().
    """
    if not _channel:
        logger.error("Impossible de consommer : pas de channel RabbitMQ")
        return

    queue = await _channel.declare_queue(QUEUE_NAME, durable=True)
    await queue.consume(_on_message)
    logger.info("Consumer RabbitMQ actif — en attente de messages sur '%s'", QUEUE_NAME)


async def _on_message(message: IncomingMessage) -> None:
    """
    Callback appelé pour chaque message reçu.
    Délègue le traitement au VoteConsumer puis acquitte/rejette le message.
    """
    from app.v1.services.vote_consumer import process_vote_message

    async with message.process(requeue=True):
        # requeue=True : si le traitement échoue, le message retourne dans la queue
        try:
            body = json.loads(message.body.decode())
            logger.info(
                "📩 Message reçu: vote de %s pour le candidat %s (élection %s)",
                body.get("voter_id", "?"),
                body.get("candidate_id", "?"),
                body.get("election_id", "?"),
            )
            await process_vote_message(body)
        except json.JSONDecodeError:
            logger.error("❌ Message invalide (JSON malformé): %s", message.body)
        except Exception as e:
            logger.exception("❌ Erreur lors du traitement du message: %s", e)
            raise  # Le message sera re-queued grâce à requeue=True


async def disconnect() -> None:
    """Ferme proprement la connexion RabbitMQ."""
    global _connection, _channel

    if _channel:
        await _channel.close()
        _channel = None
    if _connection:
        await _connection.close()
        _connection = None

    logger.info("Connexion RabbitMQ fermée")
