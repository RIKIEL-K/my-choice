import useSWR from "swr";
import { electionFetcher } from "@/features/hooks/swr/fetcher/election/electionFetcher";
import type { ElectionListResponse, ElectionStats } from "@/types/api/election/election";

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
