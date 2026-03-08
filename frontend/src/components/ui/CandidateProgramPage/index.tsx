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
    GraduationCap,
    Users,
    Target,
    CheckCircle2,
    Calendar,
    Linkedin,
    Instagram,
    Github,
    Twitter,
    ExternalLink,
    Quote,
} from "lucide-react";
import type { Candidate } from "./candidatesProgramData";

export interface CandidateProgramPageProps {
    candidate: Candidate;
    onBack: () => void;
}

function platformIcon(platform: string) {
    switch (platform.toLowerCase()) {
        case "linkedin":
            return <Linkedin className="w-4 h-4 shrink-0" />;
        case "instagram":
            return <Instagram className="w-4 h-4 shrink-0" />;
        case "github":
            return <Github className="w-4 h-4 shrink-0" />;
        case "twitter":
            return <Twitter className="w-4 h-4 shrink-0" />;
        case "email":
            return <Mail className="w-4 h-4 shrink-0" />;
        default:
            return <ExternalLink className="w-4 h-4 shrink-0" />;
    }
}

export function CandidateProgramPage({ candidate, onBack }: CandidateProgramPageProps) {
    const electionLabel =
        candidate.electionType === "bureau"
            ? "Bureau des Étudiants"
            : "Conseil d'Administration";

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
                <span className="text-sm text-muted-foreground">{candidate.name}</span>
            </div>

            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-2xl">
                                {candidate.photo ? (
                                    <img
                                        src={candidate.photo}
                                        alt={candidate.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Avatar className="w-full h-full rounded-none">
                                        <AvatarFallback className="bg-white/20 text-white text-4xl rounded-none">
                                            {candidate.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                    {electionLabel}
                                </Badge>
                                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                    {candidate.position}
                                </Badge>
                            </div>
                            <h1 className="text-3xl md:text-4xl text-white mb-1">
                                {candidate.name}
                            </h1>
                            <p className="text-blue-100 text-lg mb-4">
                                Programme :{" "}
                                <span className="font-semibold text-white">
                                    {candidate.program}
                                </span>
                            </p>
                            <div className="bg-white/10 rounded-xl px-6 py-4 backdrop-blur-sm inline-block">
                                <p className="text-blue-50 italic text-lg">
                                    « {candidate.slogan} »
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-6">
                                {candidate.socialLinks.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg px-3 py-2 text-sm text-white"
                                    >
                                        {platformIcon(link.platform)}
                                        <span>{link.platform}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vision */}
            <Card className="border-l-4 border-l-blue-600">
                <CardContent className="p-6 md:p-8">
                    <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Quote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl mb-3">Ma Vision</h2>
                            <p className="text-muted-foreground leading-relaxed text-base">
                                {candidate.vision}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Piliers du programme */}
            <div>
                <h2 className="text-2xl mb-6 flex items-center">
                    <Target className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400 shrink-0" />
                    Programme Détaillé
                </h2>
                <div className="space-y-6">
                    {candidate.pillars.map((pillar, index) => (
                        <Card
                            key={index}
                            className={`border border-border ${pillar.color}`}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center space-x-3 text-lg">
                                    <span className="text-2xl" aria-hidden>
                                        {pillar.icon}
                                    </span>
                                    <span>{pillar.title}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pillar.proposals.map((proposal, pIndex) => (
                                        <div
                                            key={pIndex}
                                            className="bg-muted/30 dark:bg-muted/20 rounded-xl p-4 border border-border shadow-sm space-y-2"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-medium text-sm leading-snug">
                                                    {proposal.title}
                                                </h4>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs flex-shrink-0 whitespace-nowrap"
                                                >
                                                    <Calendar className="w-3 h-3 mr-1 shrink-0" />
                                                    {proposal.timeline}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {proposal.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Plan d'action */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>Plan d'Action — Calendrier</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-blue-100 dark:bg-blue-900/40" />
                        <div className="space-y-4">
                            {candidate.actionPlan.map((event, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-4 relative pl-2"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 block mb-0.5">
                                            {event.month}
                                        </span>
                                        <p className="text-sm text-muted-foreground">
                                            {event.action}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Biographie & Parcours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>Biographie</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {candidate.biography}
                        </p>
                        <Separator />
                        <div>
                            <h4 className="font-medium mb-2 flex items-center">
                                <GraduationCap className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400 shrink-0" />
                                Parcours académique
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {candidate.education}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>Engagements & Associations</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {candidate.associations.map((assoc, index) => (
                                <li
                                    key={index}
                                    className="flex items-start space-x-3"
                                >
                                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-sm text-muted-foreground">
                                        {assoc}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Contact & CTA */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl mb-2">
                                Vous souhaitez en savoir plus ?
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                Contactez {candidate.name} directement ou suivez sa
                                campagne.
                            </p>
                            <a
                                href={`mailto:${candidate.contact}`}
                                className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors mt-3 text-sm font-medium"
                            >
                                <Mail className="w-4 h-4 shrink-0" />
                                <span>{candidate.contact}</span>
                            </a>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button onClick={onBack} variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voir tous les candidats
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Voter pour ce candidat
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
