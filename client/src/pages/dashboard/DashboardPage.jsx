import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis, Cell, PieChart, Pie, Legend } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { StatCard } from '../../components/ui/StatCard';

const piePalette = ['#4fd1c5', '#7dd3fc', '#fbbf24', '#f87171', '#34d399'];

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.overview();
        setOverview(response.data);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const departmentChart = useMemo(() => overview?.charts?.departmentAllocation || [], [overview]);
  const utilizationChart = useMemo(() => overview?.charts?.assetUtilization || [], [overview]);
  const maintenanceChart = useMemo(() => overview?.charts?.maintenanceFrequency || [], [overview]);
  const auditSummary = overview?.charts?.auditSummary;
  const bookingHeatmap = useMemo(() => overview?.charts?.bookingHeatmap || [], [overview]);

  if (loading || !overview) {
    return (
      <div className="glass-panel rounded-3xl px-6 py-10 text-sm text-slate-300">
        Loading dashboard...
      </div>
    );
  }

  const kpis = overview.kpis;

  return (
    <div className="space-y-6">
      <div>
        <p className="subtle-label">Executive overview</p>
        <h2 className="section-title mt-2">Dashboard</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Live operational visibility across assets, bookings, maintenance, and audits.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Assets Available" value={kpis.assetsAvailable} hint="Ready for allocation or booking" accent />
        <StatCard label="Assets Allocated" value={kpis.assetsAllocated} hint="Currently assigned to users" />
        <StatCard label="Maintenance Active" value={kpis.maintenanceToday} hint="In progress or approved" />
        <StatCard label="Upcoming Returns" value={kpis.upcomingReturns} hint="Bookings and allocations pending return" />
        <StatCard label="Overdue Returns" value={kpis.overdueReturns} hint="Past expected return date" intent="danger" />
        <StatCard label="Pending Transfers" value={kpis.pendingTransfers} hint="Awaiting approval" />
      </div>

      <div className="glass-panel flex flex-col md:flex-row items-center justify-between gap-4 rounded-3xl p-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          <p className="text-sm text-slate-400">Common tasks you can perform right away.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {(user?.role === 'Admin' || user?.role === 'Asset Manager') && (
            <button onClick={() => navigate('/assets')} className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 hover:shadow-cyan-500/50">Register Asset</button>
          )}
          {user?.role === 'Admin' ? (
            <button onClick={() => navigate('/organization-setup')} className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-emerald-500/50">Organization Setup</button>
          ) : (
            <button onClick={() => navigate('/bookings')} className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-emerald-500/50">Book Resource</button>
          )}
          <button onClick={() => navigate('/maintenance')} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-orange-500/50">Raise Maintenance</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {(user?.role === 'Admin' || user?.role === 'Asset Manager') && (
          <div className="glass-panel rounded-3xl p-5 md:p-6">
            <h3 className="text-lg font-semibold text-white">Department Allocation</h3>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                  <XAxis dataKey="department" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#0d1b2a', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '16px' }} />
                  <Bar dataKey="count" radius={[12, 12, 0, 0]} fill="#4fd1c5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {(user?.role !== 'Employee') && (
          <div className="glass-panel rounded-3xl p-5 md:p-6">
            <h3 className="text-lg font-semibold text-white">Asset Utilization</h3>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={utilizationChart} dataKey="count" nameKey="status" outerRadius={120} innerRadius={70} paddingAngle={4}>
                    {utilizationChart.map((entry, index) => <Cell key={entry.status} fill={piePalette[index % piePalette.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0d1b2a', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '16px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {(user?.role !== 'Employee') && (
          <div className="glass-panel rounded-3xl p-5 md:p-6">
            <h3 className="text-lg font-semibold text-white">Maintenance Frequency</h3>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                  <XAxis dataKey="status" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#0d1b2a', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '16px' }} />
                  <Bar dataKey="count" radius={[12, 12, 0, 0]} fill="#7dd3fc" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {(user?.role === 'Admin' || user?.role === 'Asset Manager') && (
          <div className="glass-panel rounded-3xl p-5 md:p-6">
            <h3 className="text-lg font-semibold text-white">Booking Heatmap</h3>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingHeatmap}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                  <XAxis dataKey="hour" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#0d1b2a', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '16px' }} />
                  <Bar dataKey="count" radius={[12, 12, 0, 0]} fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {(user?.role === 'Admin' || user?.role === 'Asset Manager') && (
        <div className="glass-panel rounded-3xl p-5 md:p-6">
          <h3 className="text-lg font-semibold text-white">Audit Snapshot</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {[
              ['Planned', auditSummary?.planned || 0],
              ['In Progress', auditSummary?.inProgress || 0],
              ['Completed', auditSummary?.completed || 0],
              ['Discrepancies', (auditSummary?.missing || 0) + (auditSummary?.damaged || 0)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
