import useSWR from "swr";
import { electionFetcher } from "@/features/hooks/swr/fetcher/election/electionFetcher";
import type { Election, ElectionListResponse, ElectionStats } from "@/types/api/election/election";

/**
 * Hook to fetch the list of active elections from the election microservice.
 * SWR automatically revalidates on focus and on interval.
 */
export function useElections(voterId?: string) {
    const query = new URLSearchParams({ status: "active" });
    if (voterId) {
        query.append("voter_id", voterId);
    }

    const { data, error, isLoading, mutate } = useSWR<ElectionListResponse>(
        `/elections?${query.toString()}`,
        electionFetcher,
        {
            refreshInterval: 30_000, // re-fetch every 30s for live participation updates
        }
    );

    return {
        elections: data?.items ?? [],
        total: data?.total ?? 0,
        isLoading,
        isError: error,
        mutate,
    };
}

/**
 * Hook to fetch the dashboard statistics from the election microservice.
 */
export function useElectionStats() {
    const { data, error, isLoading, mutate } = useSWR<ElectionStats>(
        "/elections/stats",
        electionFetcher,
        {
            refreshInterval: 60_000, // re-fetch every 60s
        }
    );

    return {
        stats: data,
        isLoading,
        isError: error,
        mutate,
    };
}

/**
 * Hook to fetch a single election by ID.
 * Used when an election is selected on the dashboard so the vote counts
 * shown are always accurate with respect to the database.
 *
 * @param id - The election UUID. Pass null/undefined to disable fetching.
 * @param voterId - Optional voter user ID to compute the has_voted flag.
 */
export function useElectionDetail(id: string | null | undefined, voterId?: string) {
    const query = voterId ? `?voter_id=${voterId}` : "";

    const { data, error, isLoading, mutate } = useSWR<Election>(
        id ? `/elections/${id}${query}` : null,
        electionFetcher,
        {
            // Refresh every 15s to keep counts in sync with the DB
            // while the user is looking at this election's details.
            refreshInterval: 15_000,
        }
    );

    return {
        election: data ?? null,
        isLoading,
        isError: error,
        mutate,
    };
}
