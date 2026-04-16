"""
Vote Consumer — traite les événements de vote reçus via RabbitMQ.

Flux de traitement pour chaque message :
  1. Désérialiser le message JSON
  2. Vérifier si le vote existe déjà (idempotence)
  3. Persister le VoteRecord dans la base vote-service
  4. Invalider les caches Redis pour cette élection
  5. Calculer les nouveaux résultats
  6. Pousser les résultats à tous les clients SSE connectés

Ce module gère aussi la synchronisation initiale au démarrage :
récupération des votes existants depuis l'API election-service.
"""
import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.db.session import async_session_maker
from app.models.vote_record import VoteRecord
from app.infrastructure import redis_cache, election_client
from app.v1.services.sse_manager import sse_manager

logger = logging.getLogger("vote-service.consumer")


async def process_vote_message(body: dict) -> None:
    """
    Traite un message de vote reçu depuis RabbitMQ.

    Args:
        body: Dict avec les clés election_id, voter_id, candidate_id, voted_at

    Le traitement est idempotent : si le vote existe déjà en base,
    il est ignoré silencieusement (doublon RabbitMQ possible).
    """
    election_id = body.get("election_id")
    voter_id = body.get("voter_id")
    candidate_id = body.get("candidate_id")
    voted_at_str = body.get("voted_at")

    if not all([election_id, voter_id, candidate_id]):
        logger.error("Message incomplet — champs manquants: %s", body)
        return

    # Parse le timestamp du vote
    try:
        voted_at = datetime.fromisoformat(voted_at_str) if voted_at_str else datetime.now(timezone.utc)
    except (ValueError, TypeError):
        voted_at = datetime.now(timezone.utc)

    # 1. Persister le vote dans la base du vote-service
    async with async_session_maker() as session:
        try:
            record = VoteRecord(
                election_id=election_id,
                voter_id=voter_id,
                candidate_id=candidate_id,
                voted_at=voted_at,
            )
            session.add(record)
            await session.commit()
            logger.info(
                "✅ Vote enregistré: voter=%s → candidat=%s (élection=%s)",
                voter_id[:8],
                candidate_id[:8],
                election_id[:8],
            )
        except IntegrityError:
            # Vote déjà enregistré (doublon) — ignorer silencieusement
            await session.rollback()
            logger.debug(
                "Vote déjà existant (doublon ignoré): voter=%s, élection=%s",
                voter_id[:8],
                election_id[:8],
            )
            return

    # 2. Invalider les caches Redis pour cette élection
    await redis_cache.invalidate_election(election_id)

    # 3. Calculer les nouveaux résultats et pousser via SSE
    await _push_updated_results(election_id)


async def _push_updated_results(election_id: str) -> None:
    """
    Calcule les résultats mis à jour et les pousse aux clients SSE.
    Appelé après chaque vote traité avec succès.
    """
    from app.v1.services.results_service import ResultsService

    async with async_session_maker() as session:
        service = ResultsService(session)
        results = await service.get_results(election_id)

    if results:
        await sse_manager.publish(election_id, results)


async def sync_votes_from_election_service() -> None:
    """
    Synchronise les votes existants depuis election-service au démarrage.

    Permet au vote-service de rattraper les votes émis avant que le
    consumer RabbitMQ ne soit actif. Utilise l'endpoint interne
    GET /elections/{id}/votes/sync d'election-service.
    """
    logger.info("🔄 Synchronisation des votes existants depuis election-service...")

    # Récupérer la liste des élections actives
    elections = await election_client.get_elections_list()
    if not elections:
        logger.info("Aucune élection active à synchroniser")
        return

    total_synced = 0

    for election in elections:
        election_id = election.get("id")
        if not election_id:
            continue

        # Récupérer les votes de cette élection
        votes = await election_client.get_election_votes(election_id)
        if not votes:
            continue

        # Insérer les votes manquants dans notre base
        async with async_session_maker() as session:
            for vote_data in votes:
                voter_id = vote_data.get("voter_id")
                candidate_id = vote_data.get("candidate_id")
                voted_at_str = vote_data.get("voted_at")

                if not all([voter_id, candidate_id]):
                    continue

                # Vérifier si le vote existe déjà
                existing = await session.execute(
                    select(VoteRecord).where(
                        VoteRecord.election_id == election_id,
                        VoteRecord.voter_id == voter_id,
                    )
                )
                if existing.scalar_one_or_none():
                    continue  # Déjà synchronisé

                try:
                    voted_at = (
                        datetime.fromisoformat(voted_at_str)
                        if voted_at_str
                        else datetime.now(timezone.utc)
                    )
                except (ValueError, TypeError):
                    voted_at = datetime.now(timezone.utc)

                record = VoteRecord(
                    election_id=election_id,
                    voter_id=voter_id,
                    candidate_id=candidate_id,
                    voted_at=voted_at,
                )
                session.add(record)
                total_synced += 1

            await session.commit()

    logger.info("🔄 Synchronisation terminée: %d vote(s) importé(s)", total_synced)
