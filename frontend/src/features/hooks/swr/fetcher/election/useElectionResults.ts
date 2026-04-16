/**
 * Hook de résultats d'élection en temps réel via SSE (Server-Sent Events).
 *
 * Architecture :
 *   1. Le frontend se connecte au flux SSE du vote-service
 *   2. Le vote-service envoie immédiatement l'état actuel (initial state)
 *   3. À chaque nouveau vote traité par le consumer RabbitMQ, le vote-service
 *      pousse les résultats mis à jour via SSE
 *   4. Un heartbeat est envoyé toutes les 30s pour maintenir la connexion
 *
 * En cas de déconnexion, EventSource tente automatiquement de se reconnecter.
 * Le bouton "Actualiser" du composant force une reconnexion manuelle.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import type { ElectionResultsData } from "@/types/api/election/electionResults";

/**
 * URL de base du vote-service.
 * Configurable via VITE_VOTE_SERVICE_URL dans le .env du frontend.
 */
const VOTE_SERVICE_URL =
  import.meta.env.VITE_VOTE_SERVICE_URL || "http://127.0.0.1:8002";

/**
 * Fetch election results via SSE (Server-Sent Events).
 *
 * @param electionId – UUID de l'élection
 * @param enabled – false pour suspendre la connexion SSE (default: true)
 */
export function useElectionResults(
  electionId: string | null,
  enabled = true
) {
  const [results, setResults] = useState<ElectionResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<Error | null>(null);

  // Ref pour accéder à l'EventSource sans recréer l'effet
  const eventSourceRef = useRef<EventSource | null>(null);

  /**
   * Établit la connexion SSE vers le vote-service.
   * Appelé à la première connexion et lors d'un refresh manuel.
   */
  const connect = useCallback(() => {
    if (!electionId) return;

    // Fermer la connexion existante avant d'en ouvrir une nouvelle
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsLoading(true);
    setIsError(null);

    // Connexion SSE au flux de résultats du vote-service
    const url = `${VOTE_SERVICE_URL}/api/v1/elections/${electionId}/results/stream`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    // Chaque message SSE contient les résultats complets en JSON
    es.onmessage = (event) => {
      try {
        const data: ElectionResultsData = JSON.parse(event.data);
        setResults(data);
        setIsLoading(false);
        setIsError(null);
      } catch (err) {
        console.error("[SSE] Erreur de parsing:", err);
      }
    };

    // EventSource tente automatiquement de se reconnecter en cas d'erreur
    es.onerror = () => {
      setIsError(new Error("Connexion SSE perdue — tentative de reconnexion..."));
      setIsLoading(false);
    };
  }, [electionId]);

  /**
   * Effet principal : connexion SSE au montage, déconnexion au démontage.
   */
  useEffect(() => {
    if (!enabled || !electionId) {
      setIsLoading(false);
      return;
    }

    connect();

    // Nettoyage : fermer la connexion SSE quand le composant se démonte
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [electionId, enabled, connect]);

  /**
   * Force une reconnexion SSE (utilisé par le bouton "Actualiser").
   * La reconnexion envoie immédiatement les résultats actuels (initial state).
   */
  const mutate = useCallback(async () => {
    connect();
  }, [connect]);

  return {
    results,
    isLoading,
    isError,
    mutate,
  };
}
