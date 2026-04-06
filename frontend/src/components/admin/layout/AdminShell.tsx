import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  LayoutDashboard, Vote, Users, Settings, LogOut,
  ChevronLeft, Menu, X, GraduationCap, Shield
} from 'lucide-react';
import { AdminDashboard } from '../dashboard/AdminDashboard';
import { AdminElections } from '../elections/AdminElections';
import { AdminCandidates } from '../candidates/AdminCandidates';
import { AdminStudents } from '../students/AdminStudents';
import { AdminSettings } from '../settings/AdminSettings';

type AdminPage = 'dashboard' | 'elections' | 'candidates' | 'students' | 'settings';

const navItems: { id: AdminPage; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'elections', label: 'Élections', icon: Vote },
  { id: 'candidates', label: 'Candidats', icon: Users },
  { id: 'students', label: 'Étudiants', icon: GraduationCap },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export function AdminShell() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <AdminDashboard onNavigate={p => setCurrentPage(p as AdminPage)} />;
      case 'elections': return <AdminElections />;
      case 'candidates': return <AdminCandidates />;
      case 'students': return <AdminStudents />;
      case 'settings': return <AdminSettings />;
      default: return <AdminDashboard onNavigate={p => setCurrentPage(p as AdminPage)} />;
    }
  };

  const currentItem = navItems.find(n => n.id === currentPage);

  return (
    <div className="fixed inset-0 flex bg-slate-50 z-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Administration</p>
              <p className="text-slate-400 text-xs">VoteÉtudiant</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
              className={[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left group',
                currentPage === item.id
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              ].join(' ')}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${currentPage === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="flex-1">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">Administrateur</p>
              <p className="text-slate-500 text-xs">admin@ecole.fr</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Retour au site
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold text-slate-900 flex items-center gap-2">
                {currentItem && <currentItem.icon className="w-4 h-4 text-violet-500" />}
                {currentItem?.label}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Admin</span>
                <ChevronLeft className="w-3 h-3 rotate-180" />
                <span>{currentItem?.label}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-violet-100 text-violet-700 hidden sm:inline-flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse inline-block"></span>
              Mode Administrateur
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-600 border-slate-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Site
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
