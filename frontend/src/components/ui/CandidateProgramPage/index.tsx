import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import {
    ArrowLeft,
    Mail,
    Target,
    CheckCircle2,
    Quote,
    User,
    Briefcase,
    FileText,
    ListChecks,
    Loader2,
} from "lucide-react";
import type { ElectionCandidate } from "@/types/api/election/election";

export interface CandidateProgramPageProps {
    candidate: ElectionCandidate;
    electionTitle?: string;
    onBack: () => void;
}

export function CandidateProgramPage({
    candidate,
    electionTitle,
    onBack,
}: CandidateProgramPageProps) {
    const initials = candidate.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const priorities = candidate.priorities ?? [];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Breadcrumb / Retour */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="flex items-center space-x-2 -ml-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour aux candidats</span>
                </Button>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">
                    {candidate.display_name}
                </span>
            </div>

            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-2xl">
                                {candidate.avatar_url ? (
                                    <img
                                        src={candidate.avatar_url}
                                        alt={candidate.display_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Avatar className="w-full h-full rounded-none">
                                        <AvatarFallback className="bg-white/20 text-white text-4xl rounded-none">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                                {electionTitle && (
                                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                        {electionTitle}
                                    </Badge>
                                )}
                                {candidate.position && (
                                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                        {candidate.position}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl text-white mb-1">
                                {candidate.display_name}
                            </h1>
                            {candidate.program && (
                                <p className="text-blue-100 text-lg mb-4">
                                    Programme :{" "}
                                    <span className="font-semibold text-white">
                                        {candidate.program}
                                    </span>
                                </p>
                            )}
                            {candidate.slogan && (
                                <div className="bg-white/10 rounded-xl px-6 py-4 backdrop-blur-sm inline-block">
                                    <p className="text-blue-50 italic text-lg">
                                        « {candidate.slogan} »
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio */}
            {candidate.bio && (
                <Card className="border-l-4 border-l-blue-600">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <Quote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl mb-3">Biographie</h2>
                                <p className="text-muted-foreground leading-relaxed text-base">
                                    {candidate.bio}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Priorities */}
            {priorities.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <ListChecks className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>Priorités</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {priorities.map((priority, index) => (
                                <li
                                    key={index}
                                    className="flex items-start space-x-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm text-muted-foreground leading-relaxed pt-1.5">
                                        {priority}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {candidate.position && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>Poste visé</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {candidate.position}
                            </p>
                        </CardContent>
                    </Card>
                )}
                {candidate.program && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>Programme</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {candidate.program}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Separator */}
            {(candidate.bio || priorities.length > 0) && <Separator />}

            {/* Contact CTA */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl mb-2 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                {candidate.display_name}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                Candidat pour cette élection.
                            </p>
                            <a
                                href={`mailto:${candidate.user_id}`}
                                className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors mt-3 text-sm font-medium"
                            >
                                <Mail className="w-4 h-4 shrink-0" />
                                <span>Contacter le candidat</span>
                            </a>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button onClick={onBack} variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voir tous les candidats
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Target className="w-4 h-4 mr-2" />
                                Voter pour ce candidat
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function CandidateProgramPageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-pulse">
            <div className="h-8 w-40 bg-muted rounded" />
            <div className="h-64 rounded-2xl bg-muted" />
            <div className="h-40 rounded-xl bg-muted" />
            <div className="h-32 rounded-xl bg-muted" />
        </div>
    );
}

export function CandidateProgramPageError({ onBack }: { onBack: () => void }) {
    return (
        <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
            <Loader2 className="w-10 h-10 mx-auto text-muted-foreground animate-spin hidden" />
            <p className="text-xl text-muted-foreground">Candidat introuvable.</p>
            <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux candidats
            </Button>
        </div>
    );
}
