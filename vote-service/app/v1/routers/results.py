"""
Router des résultats d'élection — REST + SSE (Server-Sent Events).

Deux endpoints :
  • GET /{election_id}/results       → Réponse JSON ponctuelle
  • GET /{election_id}/results/stream → Flux SSE temps réel

Le flux SSE :
  1. Envoie immédiatement les résultats actuels (initial state)
  2. Pousse un événement à chaque nouveau vote traité par le consumer RabbitMQ
  3. Envoie un heartbeat toutes les 30s pour maintenir la connexion
"""
import asyncio
import json
import logging

from fastapi import APIRouter, Depends
from starlette.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.v1.services.results_service import ResultsService
from app.v1.services.sse_manager import sse_manager
from app.v1.schemas.results import ElectionResultsResponse

logger = logging.getLogger("vote-service.results")

router = APIRouter()


def get_results_service(
    session: AsyncSession = Depends(get_async_session),
) -> ResultsService:
    return ResultsService(session)


@router.get(
    "/{election_id}/results",
    response_model=ElectionResultsResponse,
    summary="Résultats d'une élection (snapshot)",
)
async def get_election_results(
    election_id: str,
    service: ResultsService = Depends(get_results_service),
):
    """
    Retourne les résultats actuels d'une élection :
    classement des candidats, tendances de votes, taux de participation.

    Les données proviennent du cache Redis si disponible,
    sinon sont calculées à la volée depuis la base de données.
    """
    results = await service.get_results(election_id)
    if not results:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Élection non trouvée")
    return results


@router.get(
    "/{election_id}/results/stream",
    summary="Flux SSE des résultats en temps réel",
)
async def stream_election_results(election_id: str):
    """
    Server-Sent Events — flux temps réel des résultats d'une élection.

    Le frontend se connecte via EventSource et reçoit :
      • data: {JSON résultats} — à chaque nouveau vote
      • : heartbeat             — toutes les 30s (maintient la connexion)

    Le consumer RabbitMQ pousse les mises à jour dans le SSEManager
    qui les distribue à tous les clients connectés pour cette élection.
    """
    async def event_generator():
        # Abonnement au flux SSE pour cette élection
        queue = sse_manager.subscribe(election_id)
        try:
            # Envoi initial : résultats actuels (le frontend reçoit l'état immédiatement)
            from app.db.session import async_session_maker
            async with async_session_maker() as session:
                service = ResultsService(session)
                initial = await service.get_results(election_id)
            if initial:
                yield f"data: {json.dumps(initial, default=str)}\n\n"

            # Boucle : attend les mises à jour via le consumer RabbitMQ
            while True:
                try:
                    # Timeout de 30s → envoie un heartbeat si aucun vote
                    data = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield f"data: {json.dumps(data, default=str)}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat : commentaire SSE qui maintient la connexion ouverte
                    yield ": heartbeat\n\n"

        except asyncio.CancelledError:
            # Le client a fermé la connexion
            pass
        finally:
            sse_manager.unsubscribe(election_id, queue)
            logger.debug("Client SSE déconnecté de l'élection %s", election_id)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            # Désactive le buffering (important pour nginx/reverse proxy)
            "X-Accel-Buffering": "no",
        },
    )
