import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Vote, Users, BarChart2, TrendingUp, AlertTriangle,
  Activity, ArrowUpRight, Bell, Zap, Loader2
} from 'lucide-react';
import { useAdminStats } from '@/features/hooks/swr/fetcher/election/useAdminElections';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

// Simple bar renderer without recharts (avoids external dep)
function MiniBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span className="truncate max-w-[80px]">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function HourChart({ data }: { data: { heure: string; votes: number }[] }) {
  if (!data.length) return <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Aucun vote aujourd'hui</div>;
  const max = Math.max(...data.map(d => d.votes), 1);
  return (
    <div className="flex items-end gap-1 h-40">
      {data.map(d => (
        <div key={d.heure} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-violet-500/80 hover:bg-violet-500 transition-colors cursor-default"
            style={{ height: `${(d.votes / max) * 100}%`, minHeight: d.votes > 0 ? '4px' : '0' }}
            title={`${d.heure}: ${d.votes} votes`}
          />
          <span className="text-[9px] text-slate-400 hidden sm:block">{d.heure.replace('h', '')}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Élections',
      value: stats?.total_elections ?? 0,
      sub: `${stats?.active_elections ?? 0} active(s)`,
      icon: Vote, color: 'text-violet-500', bg: 'bg-violet-50'
    },
    {
      label: 'Étudiants inscrits',
      value: (stats?.registered_voters ?? 0).toLocaleString('fr-FR'),
      sub: 'Électeurs enregistrés',
      icon: Users, color: 'text-blue-500', bg: 'bg-blue-50'
    },
    {
      label: 'Votes exprimés',
      value: (stats?.total_votes ?? 0).toLocaleString('fr-FR'),
      sub: `+${stats?.votes_today ?? 0} aujourd'hui`,
      icon: BarChart2, color: 'text-emerald-500', bg: 'bg-emerald-50'
    },
    {
      label: 'Participation',
      value: `${stats?.average_participation ?? 0}%`,
      sub: 'Élections actives',
      icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50'
    },
  ];

  const votesData = stats?.votes_by_hour ?? [];
  const participationData = stats?.elections_participation ?? [];
  const recentActivity = stats?.recent_activity ?? [];
  const alerts = stats?.alerts ?? [];

  const activityIcons: Record<string, string> = {
    vote: '🗳️', candidate: '👤', election: '📋', student: '🎓', report: '📊'
  };

  const partMax = Math.max(...participationData.map(d => d.participation), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 text-sm mt-1">Vue d'ensemble de la plateforme de vote</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm ${
                alert.severity === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {alert.severity === 'warning'
                  ? <AlertTriangle className="w-4 h-4 shrink-0" />
                  : <Bell className="w-4 h-4 shrink-0" />
                }
                {alert.text}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-current bg-transparent"
                onClick={() => onNavigate(alert.target)}
              >
                {alert.action}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                </div>
                <div className={`${stat.bg} p-2.5 rounded-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800">
                Votes aujourd'hui (par heure)
              </CardTitle>
              <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                <Activity className="w-3 h-3" /> En direct
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <HourChart data={votesData} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">Participation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {participationData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucune élection</p>
            ) : participationData.map((d, i) => (
              <MiniBar
                key={i}
                label={d.election}
                value={d.participation}
                maxValue={partMax}
                color="bg-blue-500"
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-800">Activité récente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucune activité récente</p>
            ) : recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm shrink-0">
                  {activityIcons[item.type] ?? '📌'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.action}</p>
                  <p className="text-xs text-slate-400 truncate">{item.detail}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-800">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Créer une élection', icon: Vote, page: 'elections', color: 'bg-violet-500 hover:bg-violet-600' },
              { label: 'Gérer les candidats', icon: Users, page: 'candidates', color: 'bg-blue-500 hover:bg-blue-600' },
              { label: 'Étudiants', icon: Zap, page: 'students', color: 'bg-orange-500 hover:bg-orange-600' },
              { label: 'Paramètres', icon: BarChart2, page: 'settings', color: 'bg-emerald-500 hover:bg-emerald-600' },
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => onNavigate(action.page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white text-sm font-medium transition-colors ${action.color}`}
              >
                <action.icon className="w-4 h-4 shrink-0" />
                {action.label}
                <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
