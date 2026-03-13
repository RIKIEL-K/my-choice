import { useParams, useNavigate } from "react-router-dom";
import { VotePage as UIVotePage } from "@/components/ui/VotePage";
import type { Candidate } from "@/components/ui/VotePage";
import { electionFetcher } from "@/features/hooks/swr/fetcher/election/electionFetcher";
import { electionClient } from "@/lib/electionClient";
import type { Election } from "@/types/api/election/election";
import useSWR from "swr";
import { useVerifiedUser } from "@/features/hooks/swr/fetcher/user/useVerifiedUser";

export function VotePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useVerifiedUser();

    // Fetch the election to know whether the current user has already voted.
    // We pass voter_id so the backend evaluates has_voted.
    const { data: election, mutate } = useSWR<Election>(
        id && user ? `/elections/${id}?voter_id=${user.id}` : null,
        electionFetcher
    );

    const candidates: Candidate[] | undefined = election?.candidates.map((c) => ({
        id: c.id,
        name: c.display_name ?? "Candidat",
        program: c.program ?? "Programme non renseigné",
        position: c.position ?? "Candidat",
        photo: c.avatar_url ?? null,
        slogan: c.slogan ?? "",
        priorities: c.priorities ?? [],
    }));

    const handleSubmit = async (candidateId: string) => {
        if (!id || !user) throw new Error("Missing context");
        await electionClient.post(`/elections/${id}/vote?voter_id=${user.id}`, {
            candidate_id: candidateId,
        });
        // Revalidate the election data so has_voted becomes true globally
        await mutate();
    };

    return (
        <UIVotePage
            onBack={() => navigate("/")}
            electionId={id}
            voterId={user?.id as string | undefined}
            candidates={candidates}
            alreadyVoted={election?.has_voted ?? false}
            onSubmit={handleSubmit}
        />
    );
}
