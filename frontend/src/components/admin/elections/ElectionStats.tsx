import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  ArrowLeft, Trophy, Users, BarChart2, TrendingUp,
  Activity, RefreshCw, Loader2, Clock, Award,
  ChevronUp, ChevronDown, Minus
} from 'lucide-react';
import { useElectionResults } from '@/features/hooks/swr/fetcher/election/useElectionResults';
import type { Election } from '@/types/api/election/election';
import type { CandidateResult, TrendPoint } from '@/types/api/election/electionResults';
import './election-stats.css';

interface ElectionStatsProps {
  election: Election;
  onBack: () => void;
}

/* ─── Rank badge colors ──────────────────────────────────────────────── */
const rankStyles: Record<number, { bg: string; text: string; icon: React.ReactNode }> = {
  1: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Trophy className="w-3.5 h-3.5" /> },
  2: { bg: 'bg-slate-100', text: 'text-slate-600', icon: <Award className="w-3.5 h-3.5" /> },
  3: { bg: 'bg-orange-100', text: 'text-orange-600', icon: <Award className="w-3.5 h-3.5" /> },
};

/* ─── Chart color palette (for trend lines) ──────────────────────────── */
const CHART_COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

/* ─── Mini trend chart (SVG polyline) ───────────────────────────────── */
function TrendChart({ trends, candidates }: { trends: TrendPoint[]; candidates: CandidateResult[] }) {
  if (!trends.length) {
    return (
      <div className="es-trend-empty">
        <Activity className="w-5 h-5 text-slate-300" />
        <p>Les tendances s'afficheront ici une fois les votes enregistrés</p>
      </div>
    );
  }

  const W = 600;
  const H = 220;
  const PAD = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVotes = Math.max(...trends.flatMap(t => t.candidates.map(c => c.votes)), 1);
  const xStep = trends.length > 1 ? chartW / (trends.length - 1) : chartW;

  // Build polyline paths per candidate
  const candidateIds = candidates.map(c => c.id);
  const paths = candidateIds.map((cId, colorIdx) => {
    const points = trends.map((t, i) => {
      const candidateData = t.candidates.find(c => c.candidate_id === cId);
      const v = candidateData?.votes ?? 0;
      const x = PAD.left + i * xStep;
      const y = PAD.top + chartH - (v / maxVotes) * chartH;
      return `${x},${y}`;
    });
    return { id: cId, color: CHART_COLORS[colorIdx % CHART_COLORS.length], d: points.join(' ') };
  });

  // Y-axis labels
  const yLabels = [0, Math.round(maxVotes / 2), maxVotes];
  // X-axis labels (show every Nth)
  const showEvery = Math.max(1, Math.floor(trends.length / 6));

  return (
    <div className="es-trend-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="w-full h-auto">
        {/* Grid lines */}
        {yLabels.map(v => {
          const y = PAD.top + chartH - (v / maxVotes) * chartH;
          return (
            <g key={v}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" className="es-chart-label">{v}</text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {trends.map((t, i) => {
          if (i % showEvery !== 0 && i !== trends.length - 1) return null;
          const x = PAD.left + i * xStep;
          const label = t.timestamp.includes('T')
            ? new Date(t.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            : t.timestamp;
          return (
            <text key={i} x={x} y={H - 8} textAnchor="middle" className="es-chart-label">{label}</text>
          );
        })}

        {/* Lines */}
        {paths.map(p => (
          <polyline
            key={p.id}
            points={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="es-trend-line"
          />
        ))}

        {/* Dots on last point */}
        {paths.map(p => {
          const lastPoint = p.d.split(' ').pop()!.split(',');
          return (
            <circle
              key={`dot-${p.id}`}
              cx={parseFloat(lastPoint[0])}
              cy={parseFloat(lastPoint[1])}
              r="4"
              fill={p.color}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="es-trend-legend">
        {candidates.map((c, i) => (
          <div key={c.id} className="es-trend-legend-item">
            <span className="es-trend-legend-dot" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="es-trend-legend-label">{c.display_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Participation donut (SVG) ──────────────────────────────────────── */
function ParticipationDonut({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="es-donut-container">
      <svg viewBox="0 0 128 128" className="es-donut-svg">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke="url(#donut-gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
          className="es-donut-progress"
        />
        <defs>
          <linearGradient id="donut-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="es-donut-label">
        <span className="es-donut-value">{pct}%</span>
        <span className="es-donut-sub">Participation</span>
      </div>
    </div>
  );
}

/* ─── Candidate result row ──────────────────────────────────────────── */
function CandidateRow({ candidate, isLeader }: { candidate: CandidateResult; isLeader: boolean }) {
  const rank = rankStyles[candidate.rank] ?? { bg: 'bg-slate-50', text: 'text-slate-500', icon: null };
  const barColor = isLeader ? 'es-bar-leader' : 'es-bar-default';

  return (
    <div className={`es-candidate-row ${isLeader ? 'es-candidate-leader' : ''}`}>
      <div className="es-candidate-info">
        <div className="es-candidate-avatar">
          {candidate.avatar_url ? (
            <img src={candidate.avatar_url} alt={candidate.display_name} className="es-avatar-img" />
          ) : (
            <div className="es-avatar-placeholder">
              {candidate.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          {isLeader && (
            <div className="es-leader-crown">
              <Trophy className="w-3 h-3 text-amber-500" />
            </div>
          )}
        </div>
        <div className="es-candidate-details">
          <div className="es-candidate-name-row">
            <h4 className="es-candidate-name">{candidate.display_name}</h4>
            <Badge className={`${rank.bg} ${rank.text} es-rank-badge`}>
              {rank.icon}
              #{candidate.rank}
            </Badge>
          </div>
          {candidate.slogan && (
            <p className="es-candidate-slogan">{candidate.slogan}</p>
          )}
        </div>
      </div>
      <div className="es-candidate-stats">
        <div className="es-votes-info">
          <span className="es-votes-count">{candidate.vote_count.toLocaleString('fr-FR')}</span>
          <span className="es-votes-label">votes</span>
        </div>
        <div className="es-percentage-container">
          <div className="es-percentage-bar">
            <div className={`es-percentage-fill ${barColor}`} style={{ width: `${candidate.vote_percentage}%` }} />
          </div>
          <span className="es-percentage-value">{candidate.vote_percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────── */
export function ElectionStats({ election, onBack }: ElectionStatsProps) {
  const { results, isLoading, isError, mutate } = useElectionResults(election.id);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate();
    setTimeout(() => setRefreshing(false), 600);
  };

  const statusLabel: Record<string, { text: string; color: string }> = {
    active: { text: 'En direct', color: 'es-status-active' },
    closed: { text: 'Terminée', color: 'es-status-closed' },
    draft: { text: 'Brouillon', color: 'es-status-draft' },
  };

  const st = statusLabel[election.status] ?? statusLabel.draft;

  return (
    <div className="es-container">
      {/* Header */}
      <div className="es-header">
        <div className="es-header-left">
          <Button variant="outline" size="sm" onClick={onBack} className="es-back-btn">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="es-header-title-row">
              <h1 className="es-title">{election.title}</h1>
              <div className={`es-status-badge ${st.color}`}>
                {election.status === 'active' && (
                  <span className="es-pulse" />
                )}
                {st.text}
              </div>
            </div>
            <p className="es-subtitle">
              <Clock className="w-3.5 h-3.5" />
              {new Date(election.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              {' → '}
              {new Date(election.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="es-refresh-btn"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="es-loading">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-slate-500 text-sm mt-3">Chargement des résultats…</p>
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <Card className="es-error-card">
          <CardContent className="es-error-content">
            <div className="es-error-icon">
              <BarChart2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="es-error-title">Résultats non disponibles</h3>
            <p className="es-error-desc">
              Les résultats de cette élection ne sont pas encore disponibles.
              Le backend doit implémenter l'endpoint <code>/admin/elections/{'{id}'}/results</code>.
            </p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results loaded */}
      {results && !isLoading && (
        <>
          {/* Overview cards */}
          <div className="es-overview-grid">
            <Card className="es-overview-card">
              <CardContent className="es-overview-card-content">
                <div className="es-overview-icon-wrap es-icon-violet">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="es-overview-label">Électeurs inscrits</p>
                  <p className="es-overview-value">{results.total_voters.toLocaleString('fr-FR')}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="es-overview-card">
              <CardContent className="es-overview-card-content">
                <div className="es-overview-icon-wrap es-icon-blue">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="es-overview-label">Votes exprimés</p>
                  <p className="es-overview-value">{results.total_votes.toLocaleString('fr-FR')}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="es-overview-card">
              <CardContent className="es-overview-card-content">
                <div className="es-overview-icon-wrap es-icon-emerald">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="es-overview-label">Participation</p>
                  <p className="es-overview-value">{results.participation}%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="es-overview-card">
              <CardContent className="es-overview-card-content">
                <div className="es-overview-icon-wrap es-icon-amber">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="es-overview-label">Candidats</p>
                  <p className="es-overview-value">{results.candidates.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="candidates" className="es-tabs">
            <TabsList className="es-tabs-list">
              <TabsTrigger value="candidates" className="es-tab">
                <Users className="w-4 h-4 mr-1.5" />
                Candidats
              </TabsTrigger>
              <TabsTrigger value="trends" className="es-tab">
                <TrendingUp className="w-4 h-4 mr-1.5" />
                Tendances
              </TabsTrigger>
              <TabsTrigger value="participation" className="es-tab">
                <Activity className="w-4 h-4 mr-1.5" />
                Participation
              </TabsTrigger>
            </TabsList>

            {/* Candidates Tab */}
            <TabsContent value="candidates">
              <div className="es-candidates-grid">
                {/* Podium */}
                <Card className="es-podium-card">
                  <CardHeader className="es-podium-header">
                    <CardTitle className="es-section-title">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      Classement
                    </CardTitle>
                    {results.last_updated && (
                      <span className="es-last-updated">
                        Mis à jour : {new Date(results.last_updated).toLocaleTimeString('fr-FR')}
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="es-podium-content">
                    {results.candidates.length === 0 ? (
                      <div className="es-empty-state">
                        <Users className="w-6 h-6 text-slate-300" />
                        <p>Aucun candidat pour cette élection</p>
                      </div>
                    ) : (
                      <div className="es-candidates-list">
                        {results.candidates.map((candidate, idx) => (
                          <CandidateRow
                            key={candidate.id}
                            candidate={candidate}
                            isLeader={idx === 0}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Participation donut */}
                <Card className="es-participation-card">
                  <CardHeader>
                    <CardTitle className="es-section-title">
                      <Activity className="w-5 h-5 text-violet-500" />
                      Participation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="es-participation-content">
                    <ParticipationDonut value={results.total_votes} total={results.total_voters} />
                    <div className="es-participation-details">
                      <div className="es-participation-detail-item">
                        <span className="es-detail-label">Votes exprimés</span>
                        <span className="es-detail-value">{results.total_votes.toLocaleString('fr-FR')}</span>
                      </div>
                      <div className="es-participation-separator" />
                      <div className="es-participation-detail-item">
                        <span className="es-detail-label">Électeurs inscrits</span>
                        <span className="es-detail-value">{results.total_voters.toLocaleString('fr-FR')}</span>
                      </div>
                      <div className="es-participation-separator" />
                      <div className="es-participation-detail-item">
                        <span className="es-detail-label">Abstention</span>
                        <span className="es-detail-value">
                          {(results.total_voters - results.total_votes).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends">
              <Card className="es-trend-card">
                <CardHeader>
                  <div className="es-trend-header">
                    <CardTitle className="es-section-title">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Évolution des votes
                    </CardTitle>
                    {election.status === 'active' && (
                      <Badge className="bg-emerald-100 text-emerald-700 es-live-badge">
                        <span className="es-live-dot" />
                        Temps réel
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <TrendChart trends={results.vote_trends} candidates={results.candidates} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Participation Tab */}
            <TabsContent value="participation">
              <div className="es-participation-tab-grid">
                <Card>
                  <CardHeader>
                    <CardTitle className="es-section-title">
                      <Activity className="w-5 h-5 text-emerald-500" />
                      Évolution de la participation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {results.participation_trends.length === 0 ? (
                      <div className="es-trend-empty">
                        <Activity className="w-5 h-5 text-slate-300" />
                        <p>Les données de participation s'afficheront ici</p>
                      </div>
                    ) : (
                      <div className="es-participation-chart">
                        <svg viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet" className="w-full h-auto">
                          {/* Grid */}
                          {[0, 25, 50, 75, 100].map(v => {
                            const y = 180 - (v / 100) * 160;
                            return (
                              <g key={v}>
                                <line x1="50" y1={y} x2="580" y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
                                <text x="42" y={y + 4} textAnchor="end" className="es-chart-label">{v}%</text>
                              </g>
                            );
                          })}
                          {/* Area + line */}
                          {(() => {
                            const pts = results.participation_trends;
                            const xStep = pts.length > 1 ? 530 / (pts.length - 1) : 530;
                            const points = pts.map((p, i) => {
                              const x = 50 + i * xStep;
                              const y = 180 - (p.participation / 100) * 160;
                              return `${x},${y}`;
                            }).join(' ');
                            const areaPoints = `50,180 ${points} ${50 + (pts.length - 1) * xStep},180`;
                            return (
                              <>
                                <polygon points={areaPoints} fill="url(#participation-gradient)" opacity="0.3" />
                                <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <defs>
                                  <linearGradient id="participation-gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                                  </linearGradient>
                                </defs>
                              </>
                            );
                          })()}
                        </svg>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stats cards */}
                <div className="es-participation-stats-col">
                  <Card className="es-stat-card">
                    <CardContent className="es-stat-card-content">
                      <div className="es-stat-header">
                        <h4 className="es-stat-title">Taux actuel</h4>
                        <div className="es-stat-icon-wrap es-icon-emerald">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="es-stat-big-value">{results.participation}%</p>
                      <div className="es-stat-detail">
                        {results.participation >= 50 ? (
                          <ChevronUp className="w-4 h-4 text-emerald-500" />
                        ) : results.participation >= 25 ? (
                          <Minus className="w-4 h-4 text-amber-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={
                          results.participation >= 50
                            ? 'text-emerald-600'
                            : results.participation >= 25
                              ? 'text-amber-600'
                              : 'text-red-600'
                        }>
                          {results.participation >= 50 ? 'Bon taux' : results.participation >= 25 ? 'Modéré' : 'Faible'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="es-stat-card">
                    <CardContent className="es-stat-card-content">
                      <div className="es-stat-header">
                        <h4 className="es-stat-title">Votes restants</h4>
                        <div className="es-stat-icon-wrap es-icon-blue">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="es-stat-big-value">
                        {(results.total_voters - results.total_votes).toLocaleString('fr-FR')}
                      </p>
                      <p className="es-stat-sub-text">
                        sur {results.total_voters.toLocaleString('fr-FR')} inscrits
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* No data yet (not loading, not error, no results) – first paint before backend */}
      {!results && !isLoading && !isError && (
        <Card className="es-error-card">
          <CardContent className="es-error-content">
            <div className="es-error-icon">
              <BarChart2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="es-error-title">En attente des résultats</h3>
            <p className="es-error-desc">
              Les résultats en temps réel seront chargés automatiquement une fois le backend connecté.
              L'endpoint attendu est <code className="es-code">/admin/elections/{'{id}'}/results</code>.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
