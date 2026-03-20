import type { FC } from "react";
import { useState } from "react";
import { Vote, Users, TrendingUp, Trophy } from "lucide-react";
import { useVerifiedUser } from "@/features/hooks/swr/fetcher/user/useVerifiedUser";
import { useNavigate } from "react-router-dom";
import { VotingDashboard } from "@/components/ui/VotingDashboard";
import type { Election, Stat } from "@/components/ui/VotingDashboard";
import {
    useElections,
    useElectionStats,
    useElectionDetail,
} from "@/features/hooks/swr/fetcher/election/useElections";

// ------------------------------------------------------------------
// Adapters: convert API types to VotingDashboard prop types
// ------------------------------------------------------------------

function adaptElection(
    e: ReturnType<typeof useElections>["elections"][number]
): Election {
    return {
        id: String(e.id),
        title: e.title,
        description: e.description ?? "",
        endDate: e.end_date,
        participation:
            e.total_voters > 0
                ? Math.round((e.vote_count / e.total_voters) * 100)
                : 0,
        totalVoters: e.total_voters,
        voted: e.vote_count,
        status: e.status,
        candidates: e.candidates.length,
        hasVoted: e.has_voted ?? false,
    };
}

function adaptStats(
    apiStats: ReturnType<typeof useElectionStats>["stats"]
): Stat[] {
    if (!apiStats) return [];
    return [
        {
            title: "Élections actives",
            value: String(apiStats.active_count),
            icon: Vote,
            change: "",
            color: "text-blue-600",
        },
        {
            title: "Étudiants inscrits",
            value: apiStats.registered_voters.toLocaleString("fr-FR"),
            icon: Users,
            change: "",
            color: "text-green-600",
        },
        {
            title: "Participation moyenne",
            value: `${apiStats.average_participation.toFixed(1)}%`,
            icon: TrendingUp,
            change: "",
            color: "text-purple-600",
        },
        {
            title: "Votes aujourd'hui",
            value: apiStats.votes_today.toLocaleString("fr-FR"),
            icon: Trophy,
            change: "",
            color: "text-orange-600",
        },
    ];
}

// ------------------------------------------------------------------
// Page
// ------------------------------------------------------------------

export const HomePage: FC = () => {
    const { user } = useVerifiedUser();
    const navigate = useNavigate();

    const { elections: apiElections, isLoading: electionsLoading } =
        useElections(user?.id as string | undefined);
    const { stats: apiStats, isLoading: statsLoading } = useElectionStats();

    // The election selected on the dashboard (controlled at page level).
    // Starts empty — the first election in the list is the default.
    const [selectedId, setSelectedId] = useState<string>("");

    // The effective ID: what the user clicked, or the first election as default.
    const effectiveSelectedId = selectedId || (apiElections[0]?.id ?? null);

    // Fetch fresh DB counts for the currently selected election.
    // SWR re-fetches immediately whenever effectiveSelectedId changes,
    // so switching elections always shows accurate vote counts from the DB.
    const { election: selectedDetail } = useElectionDetail(
        effectiveSelectedId,
        user?.id as string | undefined
    );

    if (!user) return null;

    const isLoading = electionsLoading || statsLoading;
    const elections: Election[] = (isLoading ? [] : apiElections).map(adaptElection);
    const stats = adaptStats(isLoading ? undefined : apiStats);

    return (
        <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <VotingDashboard
                elections={elections}
                stats={stats}
                isLoading={isLoading}
                selectedId={effectiveSelectedId ?? (elections[0]?.id ?? "")}
                onElectionSelect={setSelectedId}
                // Pass the fresh detail directly so VotingDashboard can use
                // it when rendering the stats panel of the selected election.
                selectedElectionDetail={
                    selectedDetail
                        ? {
                              voted: selectedDetail.vote_count,
                              totalVoters: selectedDetail.total_voters,
                              participation:
                                  selectedDetail.total_voters > 0
                                      ? Math.round(
                                            (selectedDetail.vote_count /
                                                selectedDetail.total_voters) *
                                                100
                                        )
                                      : 0,
                              candidates: selectedDetail.candidates.length,
                          }
                        : undefined
                }
                onVoteClick={(electionId) =>
                    navigate(`/elections/${electionId}/vote`)
                }
                onCalendarClick={() => navigate("/elections/calendar")}
                onCandidatesClick={() => navigate("/elections/candidates")}
                onResultsClick={() => navigate("/elections/results")}
                onNextElectionsClick={() => navigate("/elections/upcoming")}
            />
        </main>
    );
};
