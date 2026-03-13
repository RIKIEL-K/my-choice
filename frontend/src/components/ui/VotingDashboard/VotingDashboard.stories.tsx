import type { Meta, StoryObj } from "@storybook/react";
import { Vote, Users, TrendingUp, Trophy } from "lucide-react";
import { VotingDashboard } from "./index";
import type { Election, Stat } from "./index";

// ─────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────

const mockStats: Stat[] = [
    { title: "Élections actives", value: "2", icon: Vote, change: "+1", color: "text-blue-600" },
    { title: "Étudiants inscrits", value: "2 400", icon: Users, change: "+12%", color: "text-green-600" },
    { title: "Participation moyenne", value: "54.5%", icon: TrendingUp, change: "+5.2%", color: "text-purple-600" },
    { title: "Votes aujourd'hui", value: "342", icon: Trophy, change: "+28%", color: "text-orange-600" },
];

const electionBureau: Election = {
    id: "1",
    title: "Élection du Bureau des Étudiants",
    description: "Élection du président, vice-président et secrétaire général",
    endDate: "2024-12-15",
    participation: 67,
    totalVoters: 2400,
    voted: 1608,
    status: "active",
    candidates: 6,
    hasVoted: false,
};

const electionConseil: Election = {
    id: "2",
    title: "Élection du Conseil Pédagogique",
    description: "Représentants étudiants au conseil pédagogique",
    endDate: "2024-12-20",
    participation: 42,
    totalVoters: 2400,
    voted: 1008,
    status: "active",
    candidates: 4,
    hasVoted: false,
};

const electionAlreadyVoted: Election = {
    ...electionBureau,
    id: "3",
    title: "Élection de l'Association Culturelle",
    hasVoted: true,
};

// ─────────────────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────────────────

const meta: Meta<typeof VotingDashboard> = {
    title: "Pages/VotingDashboard",
    component: VotingDashboard,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
    argTypes: {
        onVoteClick: { action: "onVoteClick" },
        onCalendarClick: { action: "onCalendarClick" },
        onCandidatesClick: { action: "onCandidatesClick" },
        onResultsClick: { action: "onResultsClick" },
        onNextElectionsClick: { action: "onNextElectionsClick" },
    },
};

export default meta;
type Story = StoryObj<typeof VotingDashboard>;

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** Une seule élection, pas encore voté */
export const Default: Story = {
    args: {
        elections: [electionBureau],
        stats: mockStats,
    },
};

/** Plusieurs élections sélectionnables (radio-style) */
export const MultipleElections: Story = {
    args: {
        elections: [electionBureau, electionConseil],
        stats: mockStats,
    },
};

/** Mix d'élections : l'une déjà votée, l'autre pas */
export const PartiallyVoted: Story = {
    args: {
        elections: [electionAlreadyVoted, electionConseil],
        stats: mockStats,
    },
};

/** Toutes les élections déjà votées */
export const AllVoted: Story = {
    args: {
        elections: [
            { ...electionBureau, hasVoted: true },
            { ...electionConseil, hasVoted: true },
        ],
        stats: mockStats,
    },
};

/** Chargement */
export const Loading: Story = {
    args: {
        elections: [],
        stats: [],
        isLoading: true,
    },
};

/** Aucune élection en cours */
export const NoElections: Story = {
    args: {
        elections: [],
        stats: mockStats,
    },
};
