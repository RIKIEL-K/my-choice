"""
Internal router — endpoints internes utilisés par les autres microservices.

Ces endpoints ne sont PAS destinés au frontend. Ils sont utilisés
par le vote-service pour la synchronisation initiale des votes.
"""
import logging
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.models.vote import Vote

logger = logging.getLogger("election-service.internal")

router = APIRouter()


@router.get(
    "/elections/{election_id}/votes/sync",
    summary="Internal: votes d'une élection (pour sync vote-service)",
)
async def get_election_votes_for_sync(
    election_id: str,
    session: AsyncSession = Depends(get_async_session),
):
    """
    Retourne la liste brute des votes d'une élection.

    Endpoint interne utilisé par le vote-service au démarrage pour
    synchroniser les votes existants dans sa propre base de données.

    Retourne : [{voter_id, candidate_id, voted_at}, ...]
    """
    result = await session.execute(
        select(Vote).where(Vote.election_id == election_id)
    )
    votes = result.scalars().all()

    return [
        {
            "voter_id": v.voter_id,
            "candidate_id": v.candidate_id,
            "voted_at": v.voted_at.isoformat() if v.voted_at else None,
        }
        for v in votes
    ]
