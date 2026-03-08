import { useParams, useNavigate } from "react-router-dom";
import { VotePage as UIVotePage } from "@/components/ui/VotePage";

export function VotePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    return <UIVotePage onBack={() => navigate("/")} electionId={id} />;
}
