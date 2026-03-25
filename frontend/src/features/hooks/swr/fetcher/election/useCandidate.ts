import useSWR from "swr";
import { electionFetcher } from "@/features/hooks/swr/fetcher/election/electionFetcher";
import type { ElectionCandidate } from "@/types/api/election/election";

/**
 * Hook to fetch a single candidate by election ID and candidate ID.
 */
export function useCandidate(
    electionId: string | null | undefined,
    candidateId: string | null | undefined
) {
    const { data, error, isLoading, mutate } = useSWR<ElectionCandidate>(
        electionId && candidateId
            ? `/elections/${electionId}/candidates/${candidateId}`
            : null,
        electionFetcher,
        { revalidateOnFocus: false }
    );

    return {
        candidate: data ?? null,
        isLoading,
        isError: error,
        mutate,
    };
}
