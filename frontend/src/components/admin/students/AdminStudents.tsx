import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Search, Download, UserX, UserCheck, Users, Shield, Vote, GraduationCap, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAdminUsers, updateUserStatus, exportUsersCSV } from '@/features/hooks/swr/fetcher/user/useAdminUsers';
import type { UserStatus } from '@/types/api/user/user';

const statusConfig: Record<UserStatus, { label: string; color: string }> = {
  active: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700' },
  suspended: { label: 'Suspendu', color: 'bg-red-100 text-red-700' },
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
};

function getUserStatus(user: { is_active: boolean; is_verified: boolean; is_locked: boolean }): UserStatus {
  if (!user.is_active || user.is_locked) return 'suspended';
  if (!user.is_verified) return 'pending';
  return 'active';
}

export function AdminStudents() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [suspendTarget, setSuspendTarget] = useState<string | null>(null);
  const [activateTarget, setActivateTarget] = useState<{ id: string; action: 'activate' | 'validate' } | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const { users, counts, isLoading, mutate } = useAdminUsers({
    page: 1,
    size: 100,
    search: search || undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
  });

  const handleSuspend = useCallback(async () => {
    if (!suspendTarget) return;
    try {
      await updateUserStatus(suspendTarget, 'suspend');
      await mutate();
      toast.success('Compte suspendu');
    } catch {
      toast.error('Erreur');
    } finally {
      setSuspendTarget(null);
    }
  }, [suspendTarget, mutate]);

  const handleActivate = useCallback(async () => {
    if (!activateTarget) return;
    try {
      await updateUserStatus(activateTarget.id, activateTarget.action);
      await mutate();
      toast.success(activateTarget.action === 'validate' ? 'Compte validé' : 'Compte réactivé');
    } catch {
      toast.error('Erreur');
    } finally {
      setActivateTarget(null);
    }
  }, [activateTarget, mutate]);

  const handleExport = useCallback(async () => {
    try {
      await exportUsersCSV();
      toast.success('Export CSV téléchargé');
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setShowExportConfirm(false);
    }
  }, []);

  const statCards = [
    { label: 'Total inscrits', value: counts.total, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Actifs', value: counts.active, icon: Vote, color: 'text-violet-500', bg: 'bg-violet-50' },
    { label: 'Suspendus', value: counts.suspended, icon: Shield, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'En attente', value: counts.pending, icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Étudiants</h1>
          <p className="text-slate-500 text-sm mt-1">Gestion des comptes étudiants inscrits</p>
        </div>
        <Button variant="outline" onClick={() => setShowExportConfirm(true)}>
          <Download className="w-4 h-4 mr-2" />Exporter CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <Card key={i} className="border border-slate-100 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`${s.bg} p-2.5 rounded-lg shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="block w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-2 focus:outline-teal-600"
            placeholder="Rechercher par email..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="suspended">Suspendus</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      ) : (
        <Card className="border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Rôle</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  const status = getUserStatus(user);
                  const cfg = statusConfig[status];
                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-800">{user.email}</p>
                          <p className="text-xs text-slate-400">{user.id.slice(0, 8)}…</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge className="bg-slate-100 text-slate-600 text-xs capitalize">{user.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`${cfg.color} text-xs`}>{cfg.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          {status === 'active' ? (
                            <Button size="sm" variant="outline" onClick={() => setSuspendTarget(user.id)} className="h-7 text-xs border-red-200 text-red-500">
                              <UserX className="w-3 h-3 mr-1" />Suspendre
                            </Button>
                          ) : status === 'suspended' ? (
                            <Button size="sm" variant="outline" onClick={() => setActivateTarget({ id: user.id, action: 'activate' })} className="h-7 text-xs border-emerald-200 text-emerald-600">
                              <UserCheck className="w-3 h-3 mr-1" />Réactiver
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => setActivateTarget({ id: user.id, action: 'validate' })} className="h-7 text-xs border-emerald-200 text-emerald-600">
                              <UserCheck className="w-3 h-3 mr-1" />Valider
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">Aucun utilisateur trouvé</div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
            {users.length} utilisateur(s) affiché(s)
          </div>
        </Card>
      )}

      {/* Suspend confirmation modal */}
      <ConfirmModal
        open={suspendTarget !== null}
        title="Suspendre ce compte ?"
        message="L'étudiant ne pourra plus voter."
        variant="danger"
        onConfirm={handleSuspend}
        onCancel={() => setSuspendTarget(null)}
      />

      {/* Activate/Validate confirmation modal */}
      <ConfirmModal
        open={activateTarget !== null}
        title={activateTarget?.action === 'validate' ? 'Valider ce compte ?' : 'Réactiver ce compte ?'}
        message={activateTarget?.action === 'validate' ? "Le compte sera activé et vérifié." : "L'étudiant pourra à nouveau voter."}
        variant="info"
        onConfirm={handleActivate}
        onCancel={() => setActivateTarget(null)}
      />

      {/* Export confirmation modal */}
      <ConfirmModal
        open={showExportConfirm}
        title="Exporter les données ?"
        message="Un fichier CSV sera téléchargé."
        variant="info"
        onConfirm={handleExport}
        onCancel={() => setShowExportConfirm(false)}
      />
    </div>
  );
}
