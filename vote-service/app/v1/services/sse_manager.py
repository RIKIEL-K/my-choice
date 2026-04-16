"""
SSE Manager — gestionnaire de connexions Server-Sent Events.

Implémente un pattern pub/sub en mémoire :
  • Chaque client SSE s'abonne à une élection spécifique (subscribe)
  • Quand un vote est traité, le consumer RabbitMQ publie les nouveaux
    résultats à tous les clients abonnés à cette élection (publish)
  • Quand le client se déconnecte, il est automatiquement désabonné (unsubscribe)

Thread-safe grâce à asyncio.Queue (une queue par client connecté).
"""
import asyncio
import logging
from collections import defaultdict

logger = logging.getLogger("vote-service.sse")


class SSEManager:
    """
    Gestionnaire centralisé des connexions SSE.
    Singleton utilisé par le router (subscribe/unsubscribe) et le consumer (publish).
    """

    def __init__(self):
        # Dict[election_id, List[asyncio.Queue]]
        # Chaque queue représente un client SSE connecté
        self._subscribers: dict[str, list[asyncio.Queue]] = defaultdict(list)

    def subscribe(self, election_id: str) -> asyncio.Queue:
        """
        Abonne un nouveau client au flux SSE d'une élection.
        Retourne une asyncio.Queue dans laquelle le consumer poussera les mises à jour.
        """
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers[election_id].append(queue)
        logger.debug(
            "Nouveau client SSE pour l'élection %s (total: %d)",
            election_id,
            len(self._subscribers[election_id]),
        )
        return queue

    def unsubscribe(self, election_id: str, queue: asyncio.Queue) -> None:
        """Retire un client du flux SSE d'une élection."""
        if election_id in self._subscribers:
            try:
                self._subscribers[election_id].remove(queue)
            except ValueError:
                pass  # Déjà retiré
            # Nettoyage : supprime l'entrée si plus aucun client
            if not self._subscribers[election_id]:
                del self._subscribers[election_id]

    async def publish(self, election_id: str, data: dict) -> None:
        """
        Publie les résultats mis à jour à tous les clients SSE
        connectés à cette élection.

        Appelé par le consumer RabbitMQ après chaque vote traité.
        """
        subscribers = self._subscribers.get(election_id, [])
        if not subscribers:
            return

        logger.debug(
            "Publication SSE pour l'élection %s → %d client(s)",
            election_id,
            len(subscribers),
        )
        for queue in subscribers:
            try:
                await queue.put(data)
            except Exception as e:
                logger.warning("Erreur lors de la publication SSE: %s", e)

    @property
    def active_connections(self) -> int:
        """Nombre total de connexions SSE actives (toutes élections confondues)."""
        return sum(len(subs) for subs in self._subscribers.values())


# Singleton — partagé entre le router (subscribe) et le consumer (publish)
sse_manager = SSEManager()
