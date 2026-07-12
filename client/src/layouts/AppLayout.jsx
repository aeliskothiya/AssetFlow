import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Bars3Icon, BuildingOffice2Icon, ClipboardDocumentListIcon, CubeIcon, WrenchScrewdriverIcon, CalendarDaysIcon, Squares2X2Icon, ChartBarIcon, DocumentTextIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-80 border-r border-white/10 bg-slate-950/40 px-6 py-8 backdrop-blur xl:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 shadow-glow">
              <BuildingOffice2Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">AssetFlow</p>
              <p className="text-sm text-slate-400">Enterprise operations</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { to: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
              { to: '/assets', label: 'Asset Registration', icon: CubeIcon },
              { to: '/allocations', label: 'Asset Allocation', icon: Squares2X2Icon },
              { to: '/bookings', label: 'Resource Booking', icon: CalendarDaysIcon },
              { to: '/maintenance', label: 'Maintenance', icon: WrenchScrewdriverIcon },
              { to: '/audits', label: 'Audits', icon: ShieldCheckIcon },
              { to: '/reports', label: 'Reports', icon: DocumentTextIcon },
              { to: '/organization-setup', label: 'Organization Setup', icon: ClipboardDocumentListIcon },
            ].map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    isActive
                      ? 'bg-cyan-400/15 text-cyan-200'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/30 px-5 py-4 backdrop-blur xl:px-8">
            <div>
              <p className="subtle-label">Signed in as</p>
              <h1 className="text-base font-medium text-white">{user?.name || 'Unknown user'}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                {user?.role || 'Employee'}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Logout
              </button>
            </div>
          </header>
          <div className="flex-1 px-4 py-5 md:px-6 xl:px-8 xl:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
