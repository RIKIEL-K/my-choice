import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
    CandidateProgramPage as UICandidateProgramPage,
    CandidateProgramPageSkeleton,
    CandidateProgramPageError,
} from "@/components/ui/CandidateProgramPage";
import { useCandidate } from "@/features/hooks/swr/fetcher/election/useCandidate";
import { useElections } from "@/features/hooks/swr/fetcher/election/useElections";

export function CandidateProgramPage() {
    const { id: candidateId } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // electionId is passed as ?election=<id> query param from the candidates list
    const electionIdFromQuery = searchParams.get("election");

    // Fallback: scan all elections for the candidate (in case query param is missing)
    const { elections } = useElections();
    const electionId =
        electionIdFromQuery ??
        elections.find((e) =>
            e.candidates.some((c) => c.id === candidateId)
        )?.id ??
        null;

    const electionTitle =
        elections.find((e) => e.id === electionId)?.title;

    const { candidate, isLoading, isError } = useCandidate(
        electionId,
        candidateId
    );

    const handleBack = () => navigate("/elections/candidates");

    if (isLoading) return <CandidateProgramPageSkeleton />;
    if (isError || !candidate) return <CandidateProgramPageError onBack={handleBack} />;

    return (
        <UICandidateProgramPage
            candidate={candidate}
            electionTitle={electionTitle}
            onBack={handleBack}
        />
    );
}
