import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { reportService } from '../../services/reportService';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';

const tabs = [
  { key: 'department', label: 'Department Report' },
  { key: 'assets', label: 'Asset Report' },
  { key: 'maintenance', label: 'Maintenance Report' },
  { key: 'audit', label: 'Audit Report' },
  { key: 'bookings', label: 'Booking Report' },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('department');
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const response = await reportService[activeTab]();
        setPayload(response.data);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [activeTab]);

  const renderContent = () => {
    if (activeTab === 'department') {
      return (
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Assets</th>
                <th className="px-5 py-4">Allocated</th>
                <th className="px-5 py-4">Bookings</th>
                <th className="px-5 py-4">Maintenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/30">
              {(payload || []).map((row) => (
                <tr key={`${row.department}-${row.code}`}>
                  <td className="px-5 py-4 text-white">{row.department}</td>
                  <td className="px-5 py-4 text-slate-300">{row.code}</td>
                  <td className="px-5 py-4 text-slate-300">{row.totalAssets}</td>
                  <td className="px-5 py-4 text-slate-300">{row.allocatedAssets}</td>
                  <td className="px-5 py-4 text-slate-300">{row.totalBookings}</td>
                  <td className="px-5 py-4 text-slate-300">{row.totalMaintenance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'assets') {
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total Assets" value={payload?.total || 0} accent />
          <div className="glass-panel rounded-3xl p-5 md:col-span-2">
            <h3 className="text-lg font-semibold text-white">By Status</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {(payload?.byStatus || []).map((item) => (
                <div key={item._id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <p className="text-white">{item._id}</p>
                  <p className="mt-2 text-2xl font-semibold text-cyan-200">{item.count}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-5 md:col-span-3">
            <h3 className="text-lg font-semibold text-white">By Category</h3>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10">
                <tbody className="divide-y divide-white/10 bg-slate-950/30">
                  {(payload?.byCategory || []).map((item) => (
                    <tr key={item._id}>
                      <td className="px-5 py-4 text-white">{item._id}</td>
                      <td className="px-5 py-4 text-slate-300">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'maintenance') {
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total Maintenance" value={payload?.total || 0} accent />
          <div className="glass-panel rounded-3xl p-5 md:col-span-2">
            <h3 className="text-lg font-semibold text-white">By Status</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {(payload?.byStatus || []).map((item) => (
                <span key={item._id} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  {item._id}: {item.count}
                </span>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-5 md:col-span-3">
            <h3 className="text-lg font-semibold text-white">By Priority</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {(payload?.byPriority || []).map((item) => (
                <span key={item._id} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  {item._id}: {item.count}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'audit') {
      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Cycles" value={payload?.cycles?.length || 0} accent />
            <StatCard label="Discrepancies" value={payload?.discrepancyCount || 0} hint="Missing or damaged records" />
            <StatCard label="Status Breakdown" value={(payload?.byStatus || []).length} hint="Audit finding categories" />
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Cycle</th>
                  <th className="px-5 py-4">Auditor</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-950/30">
                {(payload?.cycles || []).map((cycle) => (
                  <tr key={cycle._id}>
                    <td className="px-5 py-4 text-white">{cycle.title}</td>
                    <td className="px-5 py-4 text-slate-300">{cycle.auditor?.name || 'Unassigned'}</td>
                    <td className="px-5 py-4 text-slate-300">{cycle.department?.name || 'All departments'}</td>
                    <td className="px-5 py-4 text-slate-300">{cycle.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Bookings" value={payload?.total || 0} accent />
        <div className="glass-panel rounded-3xl p-5 md:col-span-2">
          <h3 className="text-lg font-semibold text-white">By Status</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {(payload?.byStatus || []).map((item) => (
              <span key={item._id} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                {item._id}: {item.count}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleExportCsv = async () => {
    try {
      const token = localStorage.getItem('assetflow_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/export/csv?type=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to export CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}-report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="subtle-label">Operational intelligence</p>
          <h2 className="section-title mt-2">Reports</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Review department, asset, maintenance, audit, and booking summaries from one place.</p>
        </div>
        {activeTab === 'department' && (
          <button 
            onClick={handleExportCsv}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
          >
            Export CSV
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <Button key={tab.key} variant={activeTab === tab.key ? 'primary' : 'secondary'} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="glass-panel rounded-3xl px-6 py-10 text-sm text-slate-300">Loading report...</div>
      ) : renderContent()}
    </div>
  );
}
