import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog";
import { ArrowLeft, Vote, CheckCircle, AlertTriangle, Info, Clock } from "lucide-react";
import toast from "react-hot-toast";

export interface VotePageProps {
    onBack: () => void;
}

export interface Candidate {
    id: string;
    name: string;
    program: string;
    position: string;
    photo: string | null;
    slogan: string;
    priorities: string[];
}

const defaultCandidates: Candidate[] = [
    {
        id: "sarah",
        name: "Sarah Dupont",
        program: "Renouveau Étudiant",
        position: "Présidente",
        photo: null,
        slogan: "Ensemble pour un campus plus dynamique",
        priorities: [
            "Amélioration des équipements sportifs",
            "Réduction des frais de restauration",
            "Extension des horaires de la bibliothèque",
        ],
    },
    {
        id: "thomas",
        name: "Thomas Martin",
        program: "Ensemble Plus Loin",
        position: "Président",
        photo: null,
        slogan: "Innovation et solidarité étudiante",
        priorities: [
            "Digitalisation des services étudiants",
            "Création d'espaces de coworking",
            "Programme de mentorat étudiant",
        ],
    },
    {
        id: "emma",
        name: "Emma Rodriguez",
        program: "Voix Étudiante",
        position: "Vice-Présidente",
        photo: null,
        slogan: "Votre voix, notre engagement",
        priorities: [
            "Amélioration de la communication école-étudiants",
            "Soutien aux étudiants internationaux",
            "Développement du campus durable",
        ],
    },
];

export function VotePage({ onBack }: VotePageProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<string>("");
    const [isVoting, setIsVoting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [voteSubmitted, setVoteSubmitted] = useState(false);

    const candidates = defaultCandidates;

    const handleVoteSubmit = async () => {
        if (!selectedCandidate) {
            toast.error("Veuillez sélectionner un candidat");
            return;
        }

        setIsVoting(true);

        // Simulation de l'envoi du vote
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setIsVoting(false);
        setVoteSubmitted(true);
        setShowConfirmation(false);

        toast.success("Votre vote a été enregistré avec succès !");
    };

    const selectedCandidateData = candidates.find((c) => c.id === selectedCandidate);

    if (voteSubmitted) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                            Vote Enregistré !
                        </h2>
                        <p className="text-green-700 dark:text-green-300 mb-6">
                            Votre vote a été pris en compte et enregistré de manière sécurisée.
                            Merci de votre participation à la démocratie étudiante.
                        </p>

                        <div className="bg-background rounded-lg p-4 mb-6 border border-border">
                            <h3 className="font-medium mb-2">Informations de confirmation</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Élection :</span>
                                    <span>Bureau des Étudiants 2024-2025</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Date et heure :</span>
                                    <span>{new Date().toLocaleString("fr-FR")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Numéro de confirmation :</span>
                                    <span className="font-mono">
                                        VT-{Date.now().toString().slice(-6)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button onClick={onBack} variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour au tableau de bord
                            </Button>
                            <Button variant="secondary">Voir les résultats</Button>
                        </div>

                        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start space-x-2">
                                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Votre vote est anonyme et sécurisé. Le numéro de confirmation ne
                                    permet pas de connaître votre choix de vote, il sert uniquement
                                    à vérifier que votre participation a bien été enregistrée.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
                <Button variant="ghost" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Élection du Bureau des Étudiants</h1>
                    <p className="text-muted-foreground">
                        Choisissez votre candidat pour l'année 2024-2025
                    </p>
                </div>
                <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">2j 5h restantes</span>
                </div>
            </div>

            {/* Instructions */}
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                Instructions de vote
                            </h3>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                <li>• Sélectionnez le candidat de votre choix en cliquant sur sa carte</li>
                                <li>• Vous ne pouvez voter qu'une seule fois pour cette élection</li>
                                <li>• Votre vote est anonyme et sécurisé</li>
                                <li>• Vous pouvez changer votre choix avant de confirmer</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Liste des candidats */}
            <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
                <div className="space-y-4">
                    {candidates.map((candidate) => (
                        <Card
                            key={candidate.id}
                            className={`cursor-pointer transition-all ${
                                selectedCandidate === candidate.id
                                    ? "border-primary bg-primary/5 shadow-md"
                                    : "hover:shadow-sm"
                            }`}
                            onClick={() => setSelectedCandidate(candidate.id)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex items-center">
                                        <RadioGroupItem
                                            value={candidate.id}
                                            id={candidate.id}
                                            className="mr-4"
                                        />
                                    </div>

                                    <Avatar className="w-16 h-16 shrink-0">
                                        <AvatarImage src={candidate.photo ?? undefined} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                            {candidate.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold">{candidate.name}</h3>
                                                <p className="text-muted-foreground">
                                                    {candidate.position}
                                                </p>
                                                <Badge variant="outline" className="mt-1">
                                                    {candidate.program}
                                                </Badge>
                                            </div>
                                        </div>

                                        <p className="text-primary font-medium mb-3 italic">
                                            &quot;{candidate.slogan}&quot;
                                        </p>

                                        <div>
                                            <h4 className="font-medium mb-2">Priorités principales :</h4>
                                            <ul className="space-y-1">
                                                {candidate.priorities.slice(0, 3).map((priority, index) => (
                                                    <li
                                                        key={index}
                                                        className="text-sm flex items-start"
                                                    >
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                                                        {priority}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </RadioGroup>

            {/* Actions */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-2">
                            {selectedCandidate ? (
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                                    <span className="font-medium">
                                        Candidat sélectionné : {selectedCandidateData?.name}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
                                    <span className="text-muted-foreground">
                                        Veuillez sélectionner un candidat
                                    </span>
                                </div>
                            )}
                        </div>

                        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                            <DialogTrigger asChild>
                                <Button
                                    disabled={!selectedCandidate}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Vote className="w-4 h-4 mr-2" />
                                    Confirmer mon vote
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirmer votre vote</DialogTitle>
                                    <DialogDescription>
                                        Vous êtes sur le point de voter pour :
                                    </DialogDescription>
                                </DialogHeader>

                                {selectedCandidateData && (
                                    <div className="py-4">
                                        <Card>
                                            <CardContent className="pt-4">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar>
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {selectedCandidateData.name
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h4 className="font-bold">
                                                            {selectedCandidateData.name}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {selectedCandidateData.program}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                                    <div className="flex items-start space-x-2">
                                        <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                                        <p className="text-sm text-orange-700 dark:text-orange-300">
                                            <strong>Attention :</strong> Une fois confirmé, vous ne
                                            pourrez plus modifier votre vote. Cette action est
                                            définitive.
                                        </p>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowConfirmation(false)}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={handleVoteSubmit}
                                        disabled={isVoting}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {isVoting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Confirmer mon vote
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
