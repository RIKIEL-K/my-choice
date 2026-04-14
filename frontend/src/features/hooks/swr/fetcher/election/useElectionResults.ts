/**
 * Hook for fetching real-time election results from the backend.
 *
 * Endpoint: GET /admin/elections/:id/results
 * The backend is expected to return an ElectionResultsData payload.
 *
 * refreshInterval is set to 10s so the UI polls automatically
 * during active elections. Replace with WebSocket/SSE when ready.
 *
 * ⚠️  USE_MOCK flag: set to `true` to use local mock data while the
 *     backend endpoint is not yet implemented. Set to `false` (or remove
 *     the mock block entirely) once the real API is ready.
 */
import useSWR from "swr";
import { electionClient } from "@/lib/electionClient";
import type { ElectionResultsData } from "@/types/api/election/electionResults";

/* ═══════════════════════════════════════════════════════════════
   Toggle this to false when the real backend is ready
   ═══════════════════════════════════════════════════════════════ */
const USE_MOCK = true;

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await electionClient.get<T>(url);
  return res.data;
};

/* ─── Mock data generator ───────────────────────────────────── */

function generateMockResults(electionId: string): ElectionResultsData {
  const now = new Date();

  const candidates = [
    {
      id: "c1",
      display_name: "Aminata Diallo",
      avatar_url: null,
      slogan: "Ensemble pour un campus meilleur",
      vote_count: 347,
      vote_percentage: 38.2,
      rank: 1,
    },
    {
      id: "c2",
      display_name: "Thomas Lefèvre",
      avatar_url: null,
      slogan: "L'avenir commence ici",
      vote_count: 289,
      vote_percentage: 31.8,
      rank: 2,
    },
    {
      id: "c3",
      display_name: "Sarah Ben Ahmed",
      avatar_url: null,
      slogan: "Votre voix, notre force",
      vote_count: 174,
      vote_percentage: 19.2,
      rank: 3,
    },
    {
      id: "c4",
      display_name: "Lucas Martin",
      avatar_url: null,
      slogan: "Innover pour réussir",
      vote_count: 98,
      vote_percentage: 10.8,
      rank: 4,
    },
  ];

  // Generate hourly trend data for the past 10 hours
  const vote_trends = Array.from({ length: 10 }, (_, i) => {
    const h = new Date(now);
    h.setHours(now.getHours() - 9 + i, 0, 0, 0);
    const factor = (i + 1) / 10;
    return {
      timestamp: h.toISOString(),
      total_votes: Math.round(908 * factor),
      candidates: candidates.map((c, ci) => ({
        candidate_id: c.id,
        display_name: c.display_name,
        votes: Math.round(c.vote_count * factor * (0.85 + Math.random() * 0.3)),
      })),
    };
  });

  // Generate participation trend
  const participation_trends = Array.from({ length: 10 }, (_, i) => {
    const h = new Date(now);
    h.setHours(now.getHours() - 9 + i, 0, 0, 0);
    return {
      timestamp: h.toISOString(),
      participation: Math.min(100, Math.round(((i + 1) / 10) * 64 + Math.random() * 5)),
    };
  });

  return {
    election_id: electionId,
    election_title: "Élection BDE 2026",
    status: "active",
    total_voters: 1420,
    total_votes: 908,
    participation: 63.9,
    candidates,
    vote_trends,
    participation_trends,
    last_updated: now.toISOString(),
  };
}

/* ─── Mock fetcher (simulates network delay) ─────────────────── */

const mockFetcher = async (key: string): Promise<ElectionResultsData> => {
  await new Promise((r) => setTimeout(r, 600));
  const idMatch = key.match(/\/admin\/elections\/(.+)\/results/);
  const electionId = idMatch?.[1] ?? "unknown";
  return generateMockResults(electionId);
};

/* ─── Hook ───────────────────────────────────────────────────── */

/**
 * Fetch election results for a specific election.
 * @param electionId – The election UUID
 * @param enabled – Set to false to pause fetching (default: true)
 */
export function useElectionResults(electionId: string | null, enabled = true) {
  const { data, error, isLoading, mutate } = useSWR<ElectionResultsData>(
    enabled && electionId ? `/admin/elections/${electionId}/results` : null,
    USE_MOCK ? mockFetcher : fetcher,
    {
      refreshInterval: USE_MOCK ? 0 : 10_000,
      revalidateOnFocus: !USE_MOCK,
      dedupingInterval: 5_000,
    }
  );

  return {
    results: data ?? null,
    isLoading,
    isError: error,
    mutate,
  };
}
