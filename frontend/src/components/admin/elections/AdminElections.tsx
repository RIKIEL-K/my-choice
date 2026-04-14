import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription
} from '@/components/ui/Dialog';
import {
  Plus, Calendar, Users, BarChart2, Edit, Trash2, Play, Square,
  CheckCircle2, AlertCircle, Search, Filter, Loader2, BarChart3
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import {
  useAdminElections,
  createElection,
  updateElection,
  deleteElection,
} from '@/features/hooks/swr/fetcher/election/useAdminElections';
import type { Election, ElectionCreate, ElectionStatus } from '@/types/api/election/election';
import { ElectionStats } from './ElectionStats';

const statusConfig: Record<ElectionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'En cours', color: 'bg-emerald-100 text-emerald-700', icon: <Play className="w-3 h-3" /> },
  closed: { label: 'Terminée', color: 'bg-slate-100 text-slate-600', icon: <CheckCircle2 className="w-3 h-3" /> },
  draft: { label: 'Brouillon', color: 'bg-amber-100 text-amber-700', icon: <AlertCircle className="w-3 h-3" /> },
};

const emptyForm: ElectionCreate = {
  title: '', description: '', start_date: '', end_date: '', total_voters: 0, status: 'draft'
};

export function AdminElections() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Election | null>(null);
  const [form, setForm] = useState<ElectionCreate>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [activateTarget, setActivateTarget] = useState<string | null>(null);
  const [closeTarget, setCloseTarget] = useState<string | null>(null);
  const [statsElection, setStatsElection] = useState<Election | null>(null);

  const { elections, isLoading, mutate } = useAdminElections(
    filterStatus !== 'all' ? filterStatus : undefined
  );

  const filtered = elections.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const statusCounts = {
    active: elections.filter(e => e.status === 'active').length,
    closed: elections.filter(e => e.status === 'closed').length,
    draft: elections.filter(e => e.status === 'draft').length,
  };

  const handleCreate = async () => {
    if (!form.title || !form.start_date || !form.end_date) {
      toast.error('Titre, dates de début et fin sont obligatoires');
      return;
    }
    setSubmitting(true);
    try {
      await createElection(form);
      await mutate();
      toast.success('Élection créée avec succès');
      setShowCreate(false);
      setForm(emptyForm);
    } catch {
      toast.error('Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!showEdit) return;
    setSubmitting(true);
    try {
      await updateElection(showEdit.id, {
        title: showEdit.title,
        description: showEdit.description ?? undefined,
        start_date: showEdit.start_date,
        end_date: showEdit.end_date,
        total_voters: showEdit.total_voters,
      });
      await mutate();
      toast.success('Élection mise à jour');
      setShowEdit(null);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = useCallback(async () => {
    if (!activateTarget) return;
    try {
      await updateElection(activateTarget, { status: 'active' });
      await mutate();
      toast.success('Élection activée');
    } catch {
      toast.error('Erreur');
    } finally {
      setActivateTarget(null);
    }
  }, [activateTarget, mutate]);

  const handleClose = useCallback(async () => {
    if (!closeTarget) return;
    try {
      await updateElection(closeTarget, { status: 'closed' });
      await mutate();
      toast.success('Élection clôturée');
    } catch {
      toast.error('Erreur');
    } finally {
      setCloseTarget(null);
    }
  }, [closeTarget, mutate]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteElection(deleteTarget);
      await mutate();
      toast.success('Élection supprimée');
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, mutate]);

  // If a specific election is selected for stats, render the stats view
  if (statsElection) {
    return (
      <ElectionStats
        election={statsElection}
        onBack={() => setStatsElection(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Élections</h1>
          <p className="text-slate-500 text-sm mt-1">Créez et gérez toutes vos élections</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
          <Plus className="w-4 h-4 mr-2" />Nouvelle élection
        </Button>
      </div>

      {/* Status counters */}
      <div className="grid grid-cols-3 gap-3">
        {(['active', 'draft', 'closed'] as const).map(s => {
          const cfg = statusConfig[s];
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              className={[
                'p-3 rounded-xl border text-left transition-all',
                filterStatus === s
                  ? 'ring-2 ring-violet-500 border-violet-200 bg-violet-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              ].join(' ')}
            >
              <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${cfg.color} mb-2`}>
                {cfg.icon}{cfg.label}
              </div>
              <div className="text-2xl font-bold text-slate-800">{statusCounts[s]}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="block w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-2 focus:outline-teal-600"
            placeholder="Rechercher une élection..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <Filter className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
            <SelectValue placeholder="Filtrer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="active">En cours</SelectItem>
            <SelectItem value="closed">Terminées</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Elections list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-slate-400 text-sm">Aucune élection trouvée</CardContent>
            </Card>
          )}
          {filtered.map(election => {
            const cfg = statusConfig[election.status];
            return (
              <Card key={election.id} className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800 truncate">{election.title}</h3>
                        <Badge className={`${cfg.color} shrink-0`}>
                          {cfg.label}
                        </Badge>
                      </div>
                      {election.description && (
                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">{election.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(election.start_date).toLocaleDateString('fr-FR')} → {new Date(election.end_date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />{election.candidates.length} candidats
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart2 className="w-3.5 h-3.5" />{election.vote_count} votes ({election.participation}%)
                        </span>
                      </div>
                      {election.status !== 'draft' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span>Participation</span><span>{election.participation}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-500 rounded-full"
                              style={{ width: `${election.participation}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => setStatsElection(election)}
                        className="bg-violet-500 hover:bg-violet-600 text-white h-8 text-xs"
                      >
                        <BarChart3 className="w-3.5 h-3.5 mr-1" />Statistiques
                      </Button>
                      {election.status === 'draft' && (
                        <Button size="sm" onClick={() => setActivateTarget(election.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 text-xs">
                          <Play className="w-3.5 h-3.5 mr-1" />Activer
                        </Button>
                      )}
                      {election.status === 'active' && (
                        <Button size="sm" variant="outline" onClick={() => setCloseTarget(election.id)} className="border-red-200 text-red-600 h-8 text-xs">
                          <Square className="w-3.5 h-3.5 mr-1" />Clôturer
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setShowEdit(election)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-red-200 text-red-500" onClick={() => setDeleteTarget(election.id)}>
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

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle élection</DialogTitle>
            <DialogDescription>Configurez les paramètres de la nouvelle élection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Titre *</Label>
              <Input className="mt-1" placeholder="Bureau des Étudiants 2025" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" placeholder="Description de l'élection..." value={form.description ?? ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date de début *</Label>
                <Input className="mt-1" type="datetime-local" value={form.start_date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, start_date: e.target.value }))} />
              </div>
              <div>
                <Label>Date de fin *</Label>
                <Input className="mt-1" type="datetime-local" value={form.end_date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, end_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Nombre d'électeurs éligibles</Label>
              <Input className="mt-1" type="number" min={0} value={form.total_voters ?? 0} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, total_voters: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={submitting} className="bg-violet-600 hover:bg-violet-700 text-white">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Créer l'élection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier l'élection</DialogTitle>
          </DialogHeader>
          {showEdit && (
            <div className="space-y-4 py-2">
              <div>
                <Label>Titre</Label>
                <Input className="mt-1" value={showEdit.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowEdit({ ...showEdit, title: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea className="mt-1" value={showEdit.description ?? ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setShowEdit({ ...showEdit, description: e.target.value })} />
              </div>
              <div>
                <Label>Total électeurs</Label>
                <Input className="mt-1" type="number" value={showEdit.total_voters} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowEdit({ ...showEdit, total_voters: Number(e.target.value) })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(null)}>Annuler</Button>
            <Button onClick={handleUpdate} disabled={submitting} className="bg-violet-600 hover:bg-violet-700 text-white">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate confirmation modal */}
      <ConfirmModal
        open={activateTarget !== null}
        title="Activer cette élection ?"
        message="Les électeurs pourront voter dès maintenant."
        variant="info"
        onConfirm={handleActivate}
        onCancel={() => setActivateTarget(null)}
      />

      {/* Close confirmation modal */}
      <ConfirmModal
        open={closeTarget !== null}
        title="Clôturer cette élection ?"
        message="Aucun vote ne pourra plus être enregistré."
        variant="warning"
        onConfirm={handleClose}
        onCancel={() => setCloseTarget(null)}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer cette élection ?"
        message="Toutes les données associées seront perdues."
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
