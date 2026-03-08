import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/Tabs";
import {
    GraduationCap,
    Users,
    Target,
    Calendar,
    ExternalLink,
} from "lucide-react";

export interface ElectionMock {
    id: string;
    title: string;
    description: string;
}

export interface CandidateMock {
    id: number;
    name: string;
    position: string;
    program: string;
    photo: string | null;
    description: string;
    priorities: string[];
    experience: string;
    contact: string;
}

export interface CandidatesPageProps {
    onViewProgram?: (candidateId: number) => void;
}

const candidatesBureau: CandidateMock[] = [
    {
        id: 1,
        name: "Sarah Dupont",
        position: "Présidente",
        program: "Renouveau Étudiant",
        photo: null,
        description:
            "Étudiante en Master 2 Management, déléguée de classe depuis 3 ans.",
        priorities: [
            "Amélioration des équipements sportifs",
            "Réduction des frais de restauration",
            "Extension des horaires de la bibliothèque",
        ],
        experience:
            "3 ans de délégation, membre du conseil étudiant",
        contact: "sarah.dupont@ecole.fr",
    },
    {
        id: 2,
        name: "Thomas Martin",
        position: "Président",
        program: "Ensemble Plus Loin",
        photo: null,
        description:
            "Étudiant en Master 1 Ingénierie, président du club informatique.",
        priorities: [
            "Digitalisation des services étudiants",
            "Création d'espaces de coworking",
            "Programme de mentorat étudiant",
        ],
        experience:
            "2 ans en association étudiante, organisateur d'événements",
        contact: "thomas.martin@ecole.fr",
    },
    {
        id: 3,
        name: "Emma Rodriguez",
        position: "Vice-Présidente",
        program: "Voix Étudiante",
        photo: null,
        description:
            "Étudiante en Master 2 Communication, rédactrice du journal étudiant.",
        priorities: [
            "Amélioration de la communication école-étudiants",
            "Soutien aux étudiants internationaux",
            "Développement du campus durable",
        ],
        experience: "Journaliste étudiante, coordinatrice événements",
        contact: "emma.rodriguez@ecole.fr",
    },
];

const candidatesConseil: CandidateMock[] = [
    {
        id: 4,
        name: "Lucas Moreau",
        position: "Représentant CA",
        program: "Transparence Étudiante",
        photo: null,
        description:
            "Étudiant en Master 1 Finance, trésorier de l'association étudiante.",
        priorities: [
            "Transparence des décisions du CA",
            "Défense des droits étudiants",
            "Amélioration des bourses",
        ],
        experience: "Trésorier associatif, membre commission finances",
        contact: "lucas.moreau@ecole.fr",
    },
    {
        id: 5,
        name: "Léa Dubois",
        position: "Représentante CA",
        program: "Avenir Étudiant",
        photo: null,
        description:
            "Étudiante en Master 2 RH, responsable des relations entreprises.",
        priorities: [
            "Renforcement des partenariats entreprises",
            "Amélioration de l'insertion professionnelle",
            "Développement de l'alternance",
        ],
        experience: "Relations entreprises, stage commission pédagogique",
        contact: "lea.dubois@ecole.fr",
    },
];

function CandidateCard({
    candidate,
    onViewProgram,
}: {
    candidate: CandidateMock;
    onViewProgram?: (candidateId: number) => void;
}) {
    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16 shrink-0">
                        <AvatarImage src={candidate.photo ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {candidate.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg">{candidate.name}</CardTitle>
                        <CardDescription className="text-base">
                            {candidate.position}
                        </CardDescription>
                        <Badge variant="outline" className="mt-2">
                            {candidate.program}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    {candidate.description}
                </p>

                <div>
                    <h4 className="font-medium mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-2 text-primary shrink-0" />
                        Priorités
                    </h4>
                    <ul className="space-y-1">
                        {candidate.priorities.map((priority, index) => (
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

                <div>
                    <h4 className="font-medium mb-1 flex items-center">
                        <GraduationCap className="w-4 h-4 mr-2 text-primary shrink-0" />
                        Expérience
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        {candidate.experience}
                    </p>
                </div>

                <div className="pt-2 border-t border-border">
                    <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-sm text-primary hover:underline"
                        onClick={(e) => {
                            e.preventDefault();
                            onViewProgram?.(candidate.id);
                        }}
                    >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                        Voir le programme complet
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function CandidatesPage({ onViewProgram }: CandidatesPageProps = {}) {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl mb-4">Candidats aux Élections</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Découvrez les candidats et leurs programmes pour les prochaines
                    élections étudiantes.
                </p>
            </div>

            <Tabs defaultValue="bureau" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="bureau" className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Bureau des Étudiants</span>
                    </TabsTrigger>
                    <TabsTrigger value="conseil" className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>Conseil d'Administration</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="bureau" className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                        <h2 className="text-xl mb-2">
                            Bureau des Étudiants 2024-2025
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            Élection du président, vice-président et secrétaire
                            général qui représenteront l'ensemble des étudiants.
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1 shrink-0" />
                                Fin des votes : 15 décembre 2024
                            </div>
                            <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1 shrink-0" />
                                {candidatesBureau.length} candidats
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {candidatesBureau.map((candidate) => (
                            <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                onViewProgram={onViewProgram}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="conseil" className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-6 border border-green-200 dark:border-green-800">
                        <h2 className="text-xl mb-2">
                            Représentants au Conseil d'Administration
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            Élection de 3 représentants étudiants qui siégeront
                            au conseil d'administration de l'école.
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1 shrink-0" />
                                Fin des votes : 20 décembre 2024
                            </div>
                            <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1 shrink-0" />
                                {candidatesConseil.length} candidats pour 3 postes
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {candidatesConseil.map((candidate) => (
                            <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                onViewProgram={onViewProgram}
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            <Card>
                <CardHeader>
                    <CardTitle>Informations sur les candidatures</CardTitle>
                    <CardDescription>
                        Comment devenir candidat pour les prochaines élections
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium mb-2">
                                Conditions d'éligibilité
                            </h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• Être étudiant régulièrement inscrit</li>
                                <li>• Ne pas être en situation d'exclusion disciplinaire</li>
                                <li>• Avoir au moins 18 ans</li>
                                <li>• Présenter une liste complète (pour le bureau)</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">
                                Prochaines échéances
                            </h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• Dépôt des candidatures : jusqu'au 30 novembre</li>
                                <li>• Campagne électorale : 1-10 décembre</li>
                                <li>• Débats publics : 8 décembre</li>
                                <li>• Vote électronique : 12-15 décembre</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
