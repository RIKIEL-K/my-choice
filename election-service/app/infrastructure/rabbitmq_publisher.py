"""
RabbitMQ Publisher — publie les événements de vote vers le vote-service.

Quand un vote est enregistré via l'API election-service, un message
est publié dans la queue RabbitMQ 'votes'. Le vote-service consomme
ces messages à son propre rythme pour calculer les résultats en temps réel.

Le publisher est fire-and-forget : si RabbitMQ est indisponible, le vote
reste enregistré dans la base election-service (source de vérité pour
la contrainte "un vote par électeur par élection").
"""
import json
import logging
from datetime import datetime, timezone

import aio_pika

logger = logging.getLogger("election-service.rabbitmq")

# Queue de destination — doit correspondre à la queue du consumer dans vote-service
QUEUE_NAME = "votes"

# État du module
_connection: aio_pika.abc.AbstractRobustConnection | None = None
_channel: aio_pika.abc.AbstractChannel | None = None


async def connect(rabbitmq_url: str) -> None:
    """
    Établit la connexion à RabbitMQ. Appelé au startup d'election-service.
    Utilise RobustConnection pour la reconnection automatique.
    """
    global _connection, _channel

    try:
        _connection = await aio_pika.connect_robust(rabbitmq_url)
        _channel = await _connection.channel()
        # Déclare la queue (idempotent) pour s'assurer qu'elle existe
        await _channel.declare_queue(QUEUE_NAME, durable=True)
        logger.info("✅ Connecté à RabbitMQ — prêt à publier sur '%s'", QUEUE_NAME)
    except Exception as e:
        # RabbitMQ optionnel — les votes sont quand même persistés en DB
        logger.warning("⚠️ Impossible de se connecter à RabbitMQ: %s", e)
        _connection = None
        _channel = None


async def disconnect() -> None:
    """Ferme proprement la connexion RabbitMQ."""
    global _connection, _channel

    if _channel:
        await _channel.close()
        _channel = None
    if _connection:
        await _connection.close()
        _connection = None


async def publish_vote(election_id: str, voter_id: str, candidate_id: str) -> None:
    """
    Publie un événement vote_cast dans la queue RabbitMQ.

    Message JSON :
      {
        "event": "vote_cast",
        "election_id": "uuid",
        "voter_id": "uuid",
        "candidate_id": "uuid",
        "voted_at": "ISO-8601"
      }

    Fire-and-forget : si RabbitMQ est down, on logue un warning
    mais on ne fait PAS échouer le vote (il est déjà en DB).
    """
    if not _channel:
        logger.warning(
            "RabbitMQ non connecté — le vote %s→%s ne sera pas publié",
            voter_id[:8],
            candidate_id[:8],
        )
        return

    message_body = {
        "event": "vote_cast",
        "election_id": election_id,
        "voter_id": voter_id,
        "candidate_id": candidate_id,
        "voted_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        message = aio_pika.Message(
            body=json.dumps(message_body).encode(),
            # Le message survit au redémarrage de RabbitMQ
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
        )
        await _channel.default_exchange.publish(
            message,
            routing_key=QUEUE_NAME,
        )
        logger.info(
            "📤 Vote publié: voter=%s → candidat=%s (élection=%s)",
            voter_id[:8],
            candidate_id[:8],
            election_id[:8],
        )
    except Exception as e:
        # Fire-and-forget — on ne crashe pas le endpoint
        logger.error("❌ Échec de publication RabbitMQ: %s", e)
