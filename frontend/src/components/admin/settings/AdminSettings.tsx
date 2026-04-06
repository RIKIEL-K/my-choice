import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import {
  Settings, Globe, Bell, Shield, AlertTriangle, CheckCircle,
  Save, Loader2, RefreshCw
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { useAdminSettings, updateAdminSettings } from '@/features/hooks/swr/fetcher/user/useAdminUsers';
import type { PlatformSettings } from '@/types/api/user/user';

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-2 focus:outline-teal-600',
        checked ? 'bg-violet-600' : 'bg-slate-200'
      ].join(' ')}
    >
      <span className={[
        'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-6' : 'translate-x-1'
      ].join(' ')} />
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title, description, icon: Icon, children
}: {
  title: string; description: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <Card className="border border-slate-100 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">{title}</CardTitle>
            <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

// ─── AdminSettings ────────────────────────────────────────────────────────────
export function AdminSettings() {
  const { settings: remote, isLoading, mutate } = useAdminSettings();
  const [form, setForm] = useState<PlatformSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (remote && !form) setForm(remote);
  }, [remote, form]);

  const set = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setForm(prev => prev ? { ...prev, [key]: value } : prev);
    setDirty(true);
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await updateAdminSettings(form);
      await mutate();
      toast.success('Paramètres enregistrés');
      setDirty(false);
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (remote) { setForm(remote); setDirty(false); toast.info('Modifications annulées'); }
  };

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
          <p className="text-slate-500 text-sm mt-1">Configuration de la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <Badge className="bg-amber-100 text-amber-700 gap-1">
              <AlertTriangle className="w-3 h-3" />Non sauvegardé
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleReset} disabled={!dirty || saving}>
            <RefreshCw className="w-4 h-4 mr-2" />Annuler
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Maintenance banner */}
      {form.maintenance_mode && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg border bg-red-50 border-red-200 text-red-800 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="font-medium">Mode maintenance actif</span>
          {form.maintenance_message && <span className="text-red-600">— {form.maintenance_message}</span>}
        </div>
      )}

      {/* School */}
      <Section title="Établissement" description="Informations générales de la plateforme" icon={Globe}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nom de l'établissement</Label>
            <Input
              className="mt-1"
              value={form.school_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('school_name', e.target.value)}
              placeholder="VoteÉtudiant"
            />
          </div>
          <div>
            <Label>Domaine email étudiants</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
              <input
                className="block w-full rounded-md border border-gray-300 bg-white pl-7 pr-3 py-2 text-sm text-gray-900 focus:outline-2 focus:outline-teal-600"
                value={form.school_email_domain}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('school_email_domain', e.target.value)}
                placeholder="ecole.fr"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Les e-mails doivent se terminer par ce domaine</p>
          </div>
        </div>
        <div>
          <Label>Durée max d'une élection (jours)</Label>
          <Input
            className="mt-1 max-w-xs"
            type="number"
            min={1}
            max={30}
            value={form.max_election_duration_days}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('max_election_duration_days', Number(e.target.value))}
          />
        </div>
      </Section>

      {/* Candidacy */}
      <Section title="Candidatures" description="Règles de soumission et validation des candidatures" icon={Shield}>
        <div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-800">Auto-inscription des candidats</p>
              <p className="text-xs text-slate-500">Permettre aux étudiants de se présenter eux-mêmes</p>
            </div>
            <Toggle checked={form.allow_candidate_self_registration} onChange={v => set('allow_candidate_self_registration', v)} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">Validation admin obligatoire</p>
              <p className="text-xs text-slate-500">Les candidatures doivent être approuvées avant d'être visibles</p>
            </div>
            <Toggle checked={form.require_candidate_approval} onChange={v => set('require_candidate_approval', v)} />
          </div>
        </div>
      </Section>

      {/* SMS */}
      <Section title="Notifications SMS" description="Configuration du service d'envoi de SMS" icon={Bell}>
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div>
            <p className="text-sm font-medium text-slate-800">SMS activé</p>
            <p className="text-xs text-slate-500">Envoyer des confirmations SMS aux électeurs</p>
          </div>
          <Toggle checked={form.sms_enabled} onChange={v => set('sms_enabled', v)} />
        </div>
        {form.sms_enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <Label>Fournisseur SMS</Label>
              <Input
                className="mt-1"
                value={form.sms_provider}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('sms_provider', e.target.value)}
                placeholder="twilio"
              />
            </div>
            <div>
              <Label>Identifiant expéditeur (max 11 car.)</Label>
              <Input
                className="mt-1"
                value={form.sms_sender}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('sms_sender', e.target.value)}
                placeholder="VoteEtu"
                maxLength={11}
              />
            </div>
          </div>
        )}
      </Section>

      {/* Maintenance */}
      <Section title="Maintenance" description="Mode maintenance et messages système" icon={Settings}>
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div>
            <p className="text-sm font-medium text-slate-800">Mode maintenance</p>
            <p className="text-xs text-slate-500">Désactiver l'accès public à la plateforme</p>
          </div>
          <Toggle checked={form.maintenance_mode} onChange={v => set('maintenance_mode', v)} />
        </div>
        {form.maintenance_mode && (
          <div>
            <Label>Message affiché aux utilisateurs</Label>
            <Input
              className="mt-1"
              value={form.maintenance_message}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('maintenance_message', e.target.value)}
              placeholder="La plateforme est en maintenance, elle sera de retour très prochainement."
            />
          </div>
        )}
      </Section>

      {/* Service status */}
      <Card className="border border-slate-100 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold text-slate-800">Statut des services</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Auth Service', detail: ':8000', ok: true },
              { label: 'Election Service', detail: ':8001', ok: true },
              { label: 'Base de données', detail: 'MySQL', ok: true },
              { label: 'Webhook', detail: 'actif', ok: true },
            ].map((s) => (
              <div key={s.label} className={`p-3 rounded-lg ${s.ok ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${s.ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span className={`text-xs font-medium ${s.ok ? 'text-emerald-700' : 'text-red-700'}`}>
                    {s.ok ? 'OK' : 'Erreur'}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800">{s.label}</p>
                <p className="text-xs text-slate-500">{s.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Floating save bar */}
      {dirty && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-slate-900 text-white rounded-xl shadow-2xl px-5 py-3 flex items-center gap-4">
            <span className="text-sm">Modifications non sauvegardées</span>
            <Button size="sm" variant="outline" onClick={handleReset} className="border-slate-600 text-slate-300 hover:text-white h-8 text-xs">
              Annuler
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white h-8 text-xs">
              {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Enregistrer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
