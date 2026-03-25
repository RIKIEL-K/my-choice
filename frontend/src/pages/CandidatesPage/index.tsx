import { useNavigate } from "react-router-dom";
import { CandidatesPage as UICandidatesPage } from "@/components/ui/CandidatesPage";
import type { ElectionData } from "@/components/ui/CandidatesPage";
import { useElections } from "@/features/hooks/swr/fetcher/election/useElections";

export function CandidatesPage() {
    const navigate = useNavigate();
    const { elections, isLoading } = useElections();

    // Map API elections to UI expected format
    const transformedElections: ElectionData[] = (elections ?? []).map(election => ({
        id: election.id,
        title: election.title,
        description: election.description ?? "Aucune description",
        end_date: election.end_date,
        candidates: election.candidates.map(c => ({
            id: c.id,
            name: c.display_name ?? "Candidat",
            position: c.position ?? "Candidat",
            program: c.program ?? "Programme non renseigné",
            photo: c.avatar_url ?? null,
            description: c.bio ?? "Aucune description",
            priorities: c.priorities ?? [],
            experience: "Expérience non renseignée",
            contact: c.user_id, // Contact email isn't directly exposed here, fallback to user_id
        }))
    }));

    return (
        <UICandidatesPage
            elections={transformedElections}
            isLoading={isLoading}
            onViewProgram={(candidateId, electionId) =>
                navigate(`/elections/candidates/${candidateId}/program?election=${electionId}`)
            }
        />
    );
}
