"""
Results Service — calcul des résultats d'élection avec cache Redis.

Ce service est le cœur du vote-service. Il :
  1. Vérifie le cache Redis (hit → retour immédiat)
  2. Récupère les métadonnées d'élection via l'API election-service
  3. Calcule les classements depuis vote_records (base propre au vote-service)
  4. Calcule les tendances de votes (time-series par heure)
  5. Calcule l'évolution de la participation
  6. Stocke le résultat dans Redis pour les prochaines requêtes

Les calculs lourds (classements, tendances, participation) sont les seuls
éléments cachés dans Redis.
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vote_record import VoteRecord
from app.infrastructure import redis_cache, election_client

logger = logging.getLogger("vote-service.results")

# TTLs des caches Redis
RESULTS_CACHE_TTL = 10   # 10s — classement complet
TRENDS_CACHE_TTL = 30    # 30s — tendances de votes (calcul plus lourd)


class ResultsService:
    """
    Service de calcul des résultats d'élection.
    Instancié par requête (via Depends) ou par le consumer (sessions séparées).
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_results(self, election_id: str) -> dict[str, Any] | None:
        """
        Retourne les résultats complets d'une élection.
        Utilise le cache Redis si disponible, sinon calcule tout.
        """
        # 1. Vérifier le cache Redis
        cache_key = f"results:{election_id}"
        cached = await redis_cache.get_json(cache_key)
        if cached:
            logger.debug("Cache HIT pour les résultats de l'élection %s", election_id[:8])
            return cached

        logger.debug("Cache MISS pour l'élection %s — calcul en cours...", election_id[:8])

        # 2. Récupérer les métadonnées de l'élection via l'API election-service
        election_data = await election_client.get_election(election_id)
        if not election_data:
            logger.warning("Élection %s introuvable sur election-service", election_id[:8])
            return None

        # 3. Compter les votes par candidat depuis notre propre base
        vote_counts = await self._count_votes_by_candidate(election_id)
        total_votes = sum(vote_counts.values())

        # 4. Construire le classement des candidats
        candidates_results = self._build_candidates_ranking(
            election_data.get("candidates", []),
            vote_counts,
            total_votes,
        )

        # 5. Calculer les tendances de votes (time-series)
        vote_trends = await self._compute_vote_trends(
            election_id,
            election_data.get("candidates", []),
        )

        # 6. Calculer les tendances de participation
        total_voters = election_data.get("total_voters", 0)
        participation_trends = await self._compute_participation_trends(
            election_id,
            total_voters,
        )

        # 7. Assembler le résultat final
        participation = (
            round((total_votes / total_voters) * 100, 1)
            if total_voters > 0
            else 0.0
        )

        result = {
            "election_id": election_id,
            "election_title": election_data.get("title", ""),
            "status": election_data.get("status", "draft"),
            "total_voters": total_voters,
            "total_votes": total_votes,
            "participation": participation,
            "candidates": candidates_results,
            "vote_trends": vote_trends,
            "participation_trends": participation_trends,
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

        # 8. Mettre en cache Redis (TTL court — invalidé par le consumer à chaque vote)
        await redis_cache.set_json(cache_key, result, ttl=RESULTS_CACHE_TTL)

        return result

    # ─── Méthodes privées ───────────────────────────────────────────────────

    async def _count_votes_by_candidate(self, election_id: str) -> dict[str, int]:
        """
        Compte les votes par candidat pour une élection donnée.
        Query directe sur la table vote_records du vote-service.
        """
        result = await self.session.execute(
            select(
                VoteRecord.candidate_id,
                func.count().label("vote_count"),
            )
            .where(VoteRecord.election_id == election_id)
            .group_by(VoteRecord.candidate_id)
        )
        return {row.candidate_id: row.vote_count for row in result.all()}

    @staticmethod
    def _build_candidates_ranking(
        candidates_meta: list[dict],
        vote_counts: dict[str, int],
        total_votes: int,
    ) -> list[dict]:
        """
        Construit le classement des candidats triés par nombre de votes décroissant.
        Les métadonnées (nom, avatar, slogan) viennent d'election-service,
        les comptages viennent de notre propre base.
        """
        candidates = []
        for c in candidates_meta:
            cid = c.get("id", "")
            vc = vote_counts.get(cid, 0)
            candidates.append({
                "id": cid,
                "display_name": c.get("display_name", ""),
                "avatar_url": c.get("avatar_url"),
                "slogan": c.get("slogan"),
                "vote_count": vc,
                "vote_percentage": (
                    round((vc / total_votes) * 100, 1) if total_votes > 0 else 0.0
                ),
                "rank": 0,  # Assigné ci-dessous
            })

        # Tri par vote_count décroissant pour le classement
        candidates.sort(key=lambda x: x["vote_count"], reverse=True)
        for i, c in enumerate(candidates):
            c["rank"] = i + 1

        return candidates

    async def _compute_vote_trends(
        self,
        election_id: str,
        candidates_meta: list[dict],
    ) -> list[dict]:
        """
        Calcule les tendances de votes (time-series) par tranche horaire.

        Produit des points cumulatifs : à chaque heure, combien de votes
        chaque candidat avait au total.

        Résultat caché dans Redis avec un TTL plus long (30s)
        car ce calcul est le plus coûteux.
        """
        # Vérifier le cache des tendances (TTL plus long)
        trends_key = f"trends:{election_id}"
        cached_trends = await redis_cache.get_json(trends_key)
        if cached_trends:
            return cached_trends

        # Récupérer tous les votes ordonnés par date
        result = await self.session.execute(
            select(VoteRecord.candidate_id, VoteRecord.voted_at)
            .where(VoteRecord.election_id == election_id)
            .order_by(VoteRecord.voted_at)
        )
        votes = result.all()

        if not votes:
            return []

        # Map candidat_id → display_name pour les labels
        candidates_map = {
            c.get("id", ""): c.get("display_name", "")
            for c in candidates_meta
        }

        # Déterminer la plage temporelle
        first_vote = votes[0].voted_at
        if first_vote.tzinfo is None:
            first_vote = first_vote.replace(tzinfo=timezone.utc)
        start = first_vote.replace(minute=0, second=0, microsecond=0)
        now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)

        # Construire les points de tendance par tranche horaire
        trends = []
        cumulative: dict[str, int] = {cid: 0 for cid in candidates_map}
        vote_idx = 0

        current = start
        while current <= now:
            next_hour = current + timedelta(hours=1)

            # Accumuler les votes jusqu'à cette tranche
            while vote_idx < len(votes):
                v_time = votes[vote_idx].voted_at
                if v_time.tzinfo is None:
                    v_time = v_time.replace(tzinfo=timezone.utc)
                if v_time >= next_hour:
                    break
                cid = votes[vote_idx].candidate_id
                if cid in cumulative:
                    cumulative[cid] += 1
                vote_idx += 1

            trends.append({
                "timestamp": current.isoformat(),
                "total_votes": sum(cumulative.values()),
                "candidates": [
                    {
                        "candidate_id": cid,
                        "display_name": candidates_map.get(cid, "Inconnu"),
                        "votes": cumulative[cid],
                    }
                    for cid in candidates_map
                ],
            })
            current = next_hour

        # Cacher les tendances avec un TTL plus long (calcul coûteux)
        await redis_cache.set_json(trends_key, trends, ttl=TRENDS_CACHE_TTL)

        return trends

    async def _compute_participation_trends(
        self,
        election_id: str,
        total_voters: int,
    ) -> list[dict]:
        """
        Calcule l'évolution du taux de participation par tranche horaire.
        participation = (votes cumulés / total_voters) × 100
        """
        if total_voters <= 0:
            return []

        # Récupérer les timestamps de tous les votes
        result = await self.session.execute(
            select(VoteRecord.voted_at)
            .where(VoteRecord.election_id == election_id)
            .order_by(VoteRecord.voted_at)
        )
        vote_times = [row.voted_at for row in result.all()]

        if not vote_times:
            return []

        # Déterminer la plage temporelle
        first = vote_times[0]
        if first.tzinfo is None:
            first = first.replace(tzinfo=timezone.utc)
        start = first.replace(minute=0, second=0, microsecond=0)
        now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)

        trends = []
        cumulative_votes = 0
        vote_idx = 0

        current = start
        while current <= now:
            next_hour = current + timedelta(hours=1)

            # Compter les votes dans cette tranche
            while vote_idx < len(vote_times):
                v_time = vote_times[vote_idx]
                if v_time.tzinfo is None:
                    v_time = v_time.replace(tzinfo=timezone.utc)
                if v_time >= next_hour:
                    break
                cumulative_votes += 1
                vote_idx += 1

            participation = round((cumulative_votes / total_voters) * 100, 1)
            trends.append({
                "timestamp": current.isoformat(),
                "participation": participation,
            })
            current = next_hour

        return trends
