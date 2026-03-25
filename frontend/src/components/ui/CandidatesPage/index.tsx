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
    Users,
    Target,
    Calendar,
    ExternalLink,
} from "lucide-react";

export interface CandidateData {
    id: string;
    name: string;
    position: string;
    program: string;
    photo: string | null;
    description: string;
    priorities: string[];
    experience: string;
    contact: string;
}

export interface ElectionData {
    id: string;
    title: string;
    description: string;
    end_date: string;
    candidates: CandidateData[];
}

export interface CandidatesPageProps {
    elections?: ElectionData[];
    onViewProgram?: (candidateId: string, electionId: string) => void;
    isLoading?: boolean;
}

function CandidateCard({
    candidate,
    electionId,
    onViewProgram,
}: {
    candidate: CandidateData;
    electionId: string;
    onViewProgram?: (candidateId: string, electionId: string) => void;
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

                {candidate.priorities.length > 0 && (
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
                )}

                <div className="pt-2 border-t border-border">
                    <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-sm text-primary hover:underline"
                        onClick={(e) => {
                            e.preventDefault();
                            onViewProgram?.(candidate.id, electionId);
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

export function CandidatesPage({ elections = [], onViewProgram, isLoading }: CandidatesPageProps = {}) {
    const defaultTab = elections.length > 0 ? elections[0].id : "none";

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl mb-4">Candidats aux Élections</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Découvrez les candidats et leurs programmes pour les prochaines
                    élections étudiantes.
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
            ) : elections.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                    <p>Aucune élection ou candidat n'est disponible pour le moment.</p>
                </div>
            ) : (
                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className={`flex flex-wrap w-full justify-start h-auto`}>
                        {elections.map((election) => (
                            <TabsTrigger key={`tab-${election.id}`} value={election.id} className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 py-2">
                                <Users className="w-4 h-4" />
                                <span className="truncate">{election.title}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {elections.map((election) => (
                        <TabsContent key={`content-${election.id}`} value={election.id} className="space-y-6">
                            <div className="bg-primary/5 rounded-lg p-6 border border-primary/10">
                                <h2 className="text-xl mb-2">{election.title}</h2>
                                <p className="text-muted-foreground mb-4">
                                    {election.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1 shrink-0" />
                                        Fin des votes : {new Date(election.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-1 shrink-0" />
                                        {election.candidates.length} candidats
                                    </div>
                                </div>
                            </div>

                            {election.candidates.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {election.candidates.map((candidate) => (
                                        <CandidateCard
                                            key={candidate.id}
                                            candidate={candidate}
                                            electionId={election.id}
                                            onViewProgram={onViewProgram}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground bg-card border rounded-lg">
                                    Aucun candidat ne s'est encore présenté pour cette élection.
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            )}

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
