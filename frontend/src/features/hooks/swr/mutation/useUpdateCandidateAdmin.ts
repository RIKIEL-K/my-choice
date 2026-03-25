import { useState } from "react";
import { electionClient } from "@/lib/electionClient";
import type { ElectionCandidate, CandidateUpdate } from "@/types/api/election/election";

/**
 * Mutation hook for admin-only candidate program updates.
 * Calls PATCH /elections/{electionId}/candidates/{candidateId}/admin
 */
export function useUpdateCandidateAdmin() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateCandidate = async (
        electionId: string,
        candidateId: string,
        data: CandidateUpdate
    ): Promise<ElectionCandidate | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await electionClient.patch<ElectionCandidate>(
                `/elections/${electionId}/candidates/${candidateId}/admin`,
                data
            );
            return res.data;
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { detail?: string } } })
                    ?.response?.data?.detail ?? "Erreur lors de la mise à jour.";
            setError(msg);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateCandidate, isLoading, error };
}
