import { useParams, useNavigate } from "react-router-dom";
import { CandidateProgramPage as UICandidateProgramPage } from "@/components/ui/CandidateProgramPage";
import { getCandidateProgramById } from "@/components/ui/CandidateProgramPage/candidatesProgramData";

export function CandidateProgramPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const candidate = getCandidateProgramById(Number(id));

    if (!candidate) {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center">
                <p className="text-xl text-muted-foreground">Candidat introuvable.</p>
                <button
                    className="mt-4 text-primary underline"
                    onClick={() => navigate("/elections/candidates")}
                >
                    Retour aux candidats
                </button>
            </div>
        );
    }

    return (
        <UICandidateProgramPage
            candidate={candidate}
            onBack={() => navigate("/elections/candidates")}
        />
    );
}
