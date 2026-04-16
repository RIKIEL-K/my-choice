"""
Schémas Pydantic pour les résultats d'élection.

Ces schémas correspondent exactement aux types TypeScript du frontend
(voir frontend/src/types/api/election/electionResults.ts) pour garantir
la compatibilité de l'API avec le composant ElectionStats.
"""
from pydantic import BaseModel
from typing import List, Optional


class CandidateResultSchema(BaseModel):
    """Résultat d'un candidat dans une élection spécifique."""
    id: str
    display_name: str
    avatar_url: Optional[str] = None
    slogan: Optional[str] = None
    vote_count: int
    # Pourcentage des votes (0-100), calculé côté serveur
    vote_percentage: float
    # Rang dans l'élection (1 = en tête)
    rank: int


class TrendCandidateSchema(BaseModel):
    """Données d'un candidat dans un point de tendance."""
    candidate_id: str
    display_name: str
    votes: int


class TrendPointSchema(BaseModel):
    """Point de données time-series (tendance de votes par heure)."""
    # Timestamp ISO-8601 ou label (ex: "14h", "2026-04-14T14:00")
    timestamp: str
    # Total cumulé de votes à ce point
    total_votes: int
    # Répartition par candidat à ce point
    candidates: List[TrendCandidateSchema]


class ParticipationTrendSchema(BaseModel):
    """Évolution du taux de participation dans le temps."""
    timestamp: str
    participation: float  # 0-100


class ElectionResultsResponse(BaseModel):
    """
    Payload complet des résultats d'une élection.
    Correspond à ElectionResultsData côté frontend.
    """
    election_id: str
    election_title: str
    status: str  # "draft" | "active" | "closed"
    total_voters: int
    total_votes: int
    participation: float  # 0-100
    # Liste des candidats ordonnée par rang (vote_count desc)
    candidates: List[CandidateResultSchema]
    # Évolution des votes dans le temps (pour le graphique de tendances)
    vote_trends: List[TrendPointSchema]
    # Évolution de la participation (pour le graphique de participation)
    participation_trends: List[ParticipationTrendSchema]
    # Dernière mise à jour (ISO-8601)
    last_updated: str
