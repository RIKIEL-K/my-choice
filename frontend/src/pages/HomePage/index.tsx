import type { FC } from "react";
import { Vote, Users, TrendingUp, Trophy } from "lucide-react";
import { useVerifiedUser } from "@/features/hooks/swr/fetcher/user/useVerifiedUser";
import { useLogout } from "@/features/hooks/auth/useLogout";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { VotingDashboard } from "@/components/ui/VotingDashboard";
import type { Election, Stat } from "@/components/ui/VotingDashboard";
import { useElections, useElectionStats } from "@/features/hooks/swr/fetcher/election/useElections";
import { serviceName } from "@/config";

// ------------------------------------------------------------------
// Adapters: convert API types to VotingDashboard prop types
// ------------------------------------------------------------------

function adaptElections(
  apiElections: ReturnType<typeof useElections>["elections"]
): Election[] {
  return apiElections.map((e) => ({
    id: e.id,
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
  }));
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
  const { onLogout } = useLogout();
  const navigate = useNavigate();

  const { elections: apiElections, isLoading: electionsLoading } = useElections();
  const { stats: apiStats, isLoading: statsLoading } = useElectionStats();

  if (!user) return null;

  const isLoading = electionsLoading || statsLoading;
  const elections = adaptElections(isLoading ? [] : apiElections);
  const stats = adaptStats(isLoading ? undefined : apiStats);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={serviceName}
        onEditProfile={() => navigate("/me/edit")}
        onLogout={onLogout}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VotingDashboard
          elections={elections}
          stats={stats}
          isLoading={isLoading}
          onVoteClick={(id) => {
            if (id) {
              navigate(`/elections/${id}/vote`);
            } else if (elections.length > 0) {
              navigate(`/elections/${elections[0].id}/vote`);
            }
          }}
          onCalendarClick={() => navigate("/elections/calendar")}
          onCandidatesClick={() => navigate("/elections/candidates")}
          onResultsClick={() => navigate("/elections/results")}
          onNextElectionsClick={() => navigate("/elections/upcoming")}
        />
      </main>
    </div>
  );
};
