import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Vote, Users, Clock, TrendingUp, Calendar } from "lucide-react";

export interface Election {
    id: string;
    title: string;
    description: string;
    endDate: string;
    participation: number;
    totalVoters: number;
    voted: number;
    status: string;
    candidates: number;
}

export interface Stat {
    title: string;
    value: string;
    icon: React.ElementType;
    change: string;
    color: string;
}

export interface VotingDashboardProps {
    elections: Election[];
    stats: Stat[];
    isLoading?: boolean;
    onVoteClick?: (electionId?: string) => void;
    onCalendarClick?: () => void;
    onCandidatesClick?: () => void;
    onResultsClick?: () => void;
    onNextElectionsClick?: () => void;
    closingInDays?: number;
}

/** Skeleton block for loading state */
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
);

export const VotingDashboard: React.FC<VotingDashboardProps> = ({
    elections,
    stats,
    isLoading = false,
    onVoteClick,
    onCalendarClick,
    onCandidatesClick,
    onResultsClick,
    onNextElectionsClick,
    closingInDays = 3,
}) => {
    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-40 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28" />
                    ))}
                </div>
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }
    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
                <div className="max-w-4xl">
                    <h1 className="text-3xl font-bold mb-4">Plateforme de Vote Étudiant</h1>
                    <p className="text-blue-100 text-lg mb-6">
                        Participez à la démocratie étudiante de votre école. Votre voix compte !
                    </p>
                    <div className="flex items-center space-x-4 flex-wrap gap-y-3">
                        <Button
                            variant="secondary"
                            className="bg-white text-blue-600 hover:bg-blue-50"
                            onClick={() => onVoteClick && onVoteClick()}
                        >
                            <Vote className="w-4 h-4 mr-2" />
                            Voter maintenant
                        </Button>
                        <div className="flex items-center text-blue-100">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Prochaine fermeture dans {closingInDays} jours</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                    <div className="flex items-center mt-2">
                                        <span className={`text-sm ${stat.color}`}>{stat.change}</span>
                                        <span className="text-xs text-muted-foreground ml-1">
                                            vs semaine dernière
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50">
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Active Elections */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Élections en cours</h2>
                    <Button variant="outline" onClick={onCalendarClick}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Voir le calendrier
                    </Button>
                </div>

                <div className="grid gap-6">
                    {elections.map((election) => (
                        <Card key={election.id} className="border-l-4 border-l-blue-500">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                                            <CardTitle className="text-xl">{election.title}</CardTitle>
                                            <Badge
                                                variant="secondary"
                                                className="bg-green-100 text-green-700"
                                            >
                                                Actif
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-base">
                                            {election.description}
                                        </CardDescription>
                                    </div>
                                    <Button onClick={() => onVoteClick && onVoteClick(election.id)} className="ml-4 shrink-0">
                                        <Vote className="w-4 h-4 mr-2" />
                                        Voter
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Participation */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Participation
                                            </span>
                                            <span className="font-medium">{election.participation}%</span>
                                        </div>
                                        <Progress value={election.participation} className="h-2" />
                                        <p className="text-xs text-muted-foreground">
                                            {election.voted.toLocaleString("fr-FR")} /{" "}
                                            {election.totalVoters.toLocaleString("fr-FR")} étudiants ont
                                            voté
                                        </p>
                                    </div>

                                    {/* Candidates / Days */}
                                    <div className="flex items-center space-x-8">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">
                                                {election.candidates}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Candidats</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">
                                                {new Date(election.endDate).getDate()}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Jours restants
                                            </p>
                                        </div>
                                    </div>

                                    {/* Closing date */}
                                    <div className="flex items-center justify-end">
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Fermeture le</p>
                                            <p className="font-medium">
                                                {new Date(election.endDate).toLocaleDateString("fr-FR", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                    <CardDescription>
                        Gérez votre participation aux élections étudiantes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            variant="outline"
                            className="h-20 flex-col space-y-2"
                            onClick={onCandidatesClick}
                        >
                            <Users className="w-6 h-6" />
                            <span>Voir les candidats</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex-col space-y-2"
                            onClick={onResultsClick}
                        >
                            <TrendingUp className="w-6 h-6" />
                            <span>Résultats en temps réel</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex-col space-y-2"
                            onClick={onNextElectionsClick}
                        >
                            <Calendar className="w-6 h-6" />
                            <span>Prochaines élections</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
