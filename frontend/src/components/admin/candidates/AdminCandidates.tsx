import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import { CheckCircle2, XCircle, Trash2, Search, User, Trophy, Clock, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import {
  useAdminCandidates,
  approveCandidate,
  rejectCandidate,
  deleteCandidate,
} from '@/features/hooks/swr/fetcher/election/useAdminElections';
import type { ApprovalStatus } from '@/types/api/election/election';

const statusConfig: Record<ApprovalStatus, { label: string; color: string }> = {
  approved: { label: 'Approuvé', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700' },
};

export function AdminCandidates() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showReject, setShowReject] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { candidates, isLoading, mutate } = useAdminCandidates(
    filterStatus !== 'all' ? { approval_status: filterStatus as ApprovalStatus } : undefined
  );

  const filtered = candidates.filter(c =>
    c.display_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.position ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const pending = candidates.filter(c => c.approval_status === 'pending');
  const topCandidates = [...candidates]
    .filter(c => c.vote_count > 0)
    .sort((a, b) => b.vote_count - a.vote_count)
    .slice(0, 3);

  const handleApprove = async (id: string) => {
    try {
      await approveCandidate(id);
      await mutate();
      toast.success('Candidature approuvée');
    } catch {
      toast.error('Erreur');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectCandidate(id);
      await mutate();
      toast.success('Candidature rejetée');
      setShowReject(null);
      setRejectReason('');
    } catch {
      toast.error('Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce candidat ?')) return;
    try {
      await deleteCandidate(id);
      await mutate();
      toast.success('Candidat supprimé');
    } catch {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Candidats</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez et validez les candidatures</p>
      </div>

      {/* Pending banner */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-800">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="font-semibold text-sm">{pending.length} candidature(s) en attente de validation</span>
          </div>
          <div className="space-y-2">
            {pending.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-amber-100">
                <div>
                  <span className="font-medium text-slate-800 text-sm">{c.display_name}</span>
                  {c.position && <span className="text-slate-500 text-xs ml-2">— {c.position}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => handleApprove(c.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white h-7 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Approuver
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowReject(c.id)} className="border-red-200 text-red-600 h-7 text-xs">
                    <XCircle className="w-3.5 h-3.5 mr-1" />Rejeter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top candidates */}
      {topCandidates.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {topCandidates.map((c, i) => (
            <Card key={c.id} className={`border border-slate-100 shadow-sm ${i === 0 ? 'bg-violet-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className={`w-4 h-4 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-slate-400' : 'text-orange-400'}`} />
                  <span className="text-xs text-slate-500 font-medium">#{i + 1}</span>
                </div>
                <p className="font-semibold text-slate-800 text-sm">{c.display_name}</p>
                {c.position && <p className="text-xs text-slate-500 mt-0.5">{c.position}</p>}
                <p className="text-lg font-bold text-violet-600 mt-1">{c.vote_count} votes</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="block w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-2 focus:outline-teal-600"
            placeholder="Nom ou poste..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="approved">Approuvés</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="rejected">Rejetés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Candidates list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm border border-dashed rounded-xl">Aucun candidat trouvé</div>
          )}
          {filtered.map(candidate => {
            const cfg = statusConfig[candidate.approval_status];
            return (
              <Card key={candidate.id} className="border border-slate-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm">{candidate.display_name}</span>
                        <Badge className={`${cfg.color} text-xs`}>{cfg.label}</Badge>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-2">
                        {candidate.position && <span>{candidate.position}</span>}
                        {candidate.program && <><span>·</span><span>{candidate.program}</span></>}
                        {candidate.vote_count > 0 && (
                          <><span>·</span><span className="text-violet-600 font-medium">{candidate.vote_count} votes</span></>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {candidate.approval_status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(candidate.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white h-7 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Approuver
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setShowReject(candidate.id)} className="border-red-200 text-red-600 h-7 text-xs">
                            <XCircle className="w-3.5 h-3.5 mr-1" />Rejeter
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-red-200 text-red-500" onClick={() => handleDelete(candidate.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={showReject !== null} onOpenChange={() => setShowReject(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rejeter la candidature</DialogTitle>
            <DialogDescription>Indiquez la raison du rejet (optionnel)</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Raison du rejet..."
            value={rejectReason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReject(null)}>Annuler</Button>
            <Button
              onClick={() => showReject && handleReject(showReject)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
