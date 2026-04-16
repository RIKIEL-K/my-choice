"""
Client HTTP vers l'API election-service.

Le vote-service possède sa propre base de données et n'a PAS accès
directement aux tables d'election-service. Il utilise ce client HTTP
pour récupérer les métadonnées nécessaires au calcul des résultats :

  • Détails d'une élection (titre, statut, total_voters, dates)
  • Liste des candidats (noms, avatars, slogans)
  • Votes existants pour la synchronisation initiale

Les métadonnées d'élection sont cachées dans Redis (TTL 5min)
car elles changent rarement pendant un scrutin.
"""
import logging
from typing import Any

import httpx

from app.infrastructure import redis_cache

logger = logging.getLogger("vote-service.election_client")

# Client HTTP (initialisé au startup)
_client: httpx.AsyncClient | None = None
_base_url: str = ""

# TTL du cache pour les métadonnées d'élection (5 minutes)
META_CACHE_TTL = 300


def init(election_service_url: str) -> None:
    """Initialise le client HTTP. Appelé au startup."""
    global _client, _base_url
    _base_url = election_service_url
    _client = httpx.AsyncClient(
        base_url=election_service_url,
        timeout=10.0,
    )
    logger.info("Client election-service initialisé → %s", election_service_url)


async def close() -> None:
    """Ferme le client HTTP. Appelé au shutdown."""
    global _client
    if _client:
        await _client.aclose()
        _client = None


async def get_election(election_id: str) -> dict[str, Any] | None:
    """
    Récupère les détails d'une élection depuis election-service.
    Résultat caché dans Redis pendant 5 minutes.

    Retourne un dict avec : id, title, status, total_voters, start_date,
    end_date, candidates (liste), etc.
    """
    cache_key = f"election:meta:{election_id}"

    # 1. Vérifier le cache Redis
    cached = await redis_cache.get_json(cache_key)
    if cached:
        return cached

    # 2. Cache miss → appel HTTP à election-service
    if not _client:
        logger.error("Client HTTP non initialisé")
        return None

    try:
        response = await _client.get(f"/elections/{election_id}")
        response.raise_for_status()
        data = response.json()

        # 3. Stocker dans le cache Redis (TTL 5min — les métadonnées changent rarement)
        await redis_cache.set_json(cache_key, data, ttl=META_CACHE_TTL)

        return data
    except httpx.HTTPStatusError as e:
        logger.error("Election %s non trouvée: HTTP %s", election_id, e.response.status_code)
        return None
    except httpx.RequestError as e:
        logger.error("Impossible de joindre election-service: %s", e)
        return None


async def get_elections_list() -> list[dict[str, Any]]:
    """
    Récupère la liste de toutes les élections actives.
    Utilisé pour la synchronisation initiale au démarrage.
    """
    if not _client:
        return []

    try:
        response = await _client.get("/elections", params={"status": "active", "size": 100})
        response.raise_for_status()
        data = response.json()
        return data.get("items", [])
    except Exception as e:
        logger.error("Impossible de récupérer la liste des élections: %s", e)
        return []


async def get_election_votes(election_id: str) -> list[dict[str, Any]]:
    """
    Récupère tous les votes d'une élection depuis election-service.
    Endpoint interne utilisé uniquement pour la synchronisation initiale.

    Retourne une liste de dicts : {voter_id, candidate_id, voted_at}
    """
    if not _client:
        return []

    try:
        response = await _client.get(f"/elections/{election_id}/votes/sync")
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError:
        # L'endpoint n'existe peut-être pas encore → pas grave, on skip
        logger.debug("Endpoint sync non disponible pour l'élection %s", election_id)
        return []
    except Exception as e:
        logger.error("Erreur lors de la récupération des votes pour %s: %s", election_id, e)
        return []
