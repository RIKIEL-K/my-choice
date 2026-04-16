"""
Redis Cache — cache sélectif pour les calculs lourds uniquement.

Seuls les résultats coûteux en DB sont cachés :
  • results:{election_id}       → Classement complet (TTL 10s)
  • trends:{election_id}        → Time-series des votes (TTL 30s)
  • election:meta:{election_id} → Métadonnées de l'élection (TTL 5min)

Les données simples (a-t-il voté ?, détail d'un vote) restent des queries
directes à la base de données — pas de cache inutile.
"""
import json
import logging
from typing import Any

import redis.asyncio as aioredis

logger = logging.getLogger("vote-service.redis")

# Client Redis (initialisé au startup)
_redis: aioredis.Redis | None = None


async def connect(redis_url: str) -> None:
    """Connexion au serveur Redis. Appelé au startup."""
    global _redis
    _redis = aioredis.from_url(redis_url, decode_responses=True)
    # Vérifie que la connexion fonctionne
    await _redis.ping()
    logger.info("Connecté à Redis")


async def disconnect() -> None:
    """Ferme la connexion Redis. Appelé au shutdown."""
    global _redis
    if _redis:
        await _redis.aclose()
        _redis = None
    logger.info("Connexion Redis fermée")


async def get_json(key: str) -> Any | None:
    """
    Récupère une valeur cachée et la désérialise depuis JSON.
    Retourne None si la clé n'existe pas ou si Redis est down.
    """
    if not _redis:
        return None
    try:
        data = await _redis.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        logger.warning("Redis GET échoué pour '%s': %s", key, e)
    return None


async def set_json(key: str, value: Any, ttl: int = 10) -> None:
    """
    Sérialise une valeur en JSON et la stocke dans Redis avec un TTL.
    Le TTL en secondes détermine combien de temps le cache reste valide.
    """
    if not _redis:
        return
    try:
        await _redis.setex(key, ttl, json.dumps(value, default=str))
    except Exception as e:
        logger.warning("Redis SET échoué pour '%s': %s", key, e)


async def delete(key: str) -> None:
    """Supprime une clé spécifique du cache."""
    if not _redis:
        return
    try:
        await _redis.delete(key)
    except Exception as e:
        logger.warning("Redis DELETE échoué pour '%s': %s", key, e)


async def invalidate_election(election_id: str) -> None:
    """
    Invalide tous les caches liés à une élection.
    Appelé par le consumer après chaque vote traité.
    """
    keys_to_delete = [
        f"results:{election_id}",
        f"trends:{election_id}",
    ]
    for key in keys_to_delete:
        await delete(key)
    logger.debug("Cache invalidé pour l'élection %s", election_id)
