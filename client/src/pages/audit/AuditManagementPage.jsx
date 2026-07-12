import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';
import { auditService } from '../../services/auditService';
import { assetService } from '../../services/assetService';
import { departmentService } from '../../services/departmentService';
import { userService } from '../../services/userService';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { AuditCycleFormModal } from '../../components/audit/AuditCycleFormModal';
import { AuditRecordFormModal } from '../../components/audit/AuditRecordFormModal';
import { CustomSelect } from '../../components/ui/CustomSelect';

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function AuditManagementPage() {
  const [cycles, setCycles] = useState([]);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ verified: 0, missing: 0, damaged: 0, mismatch: 0 });
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [cycleResponse, assetResponse, userResponse, departmentResponse] = await Promise.all([
        auditService.listCycles({ page: 1, limit: 50, status: filterStatus }),
        assetService.list({ page: 1, limit: 100 }),
        userService.list({ page: 1, limit: 100 }),
        departmentService.list({ page: 1, limit: 100, includeInactive: 'false' }),
      ]);
      setCycles(cycleResponse.data || []);
      setAssets(assetResponse.data || []);
      setUsers(userResponse.data || []);
      setDepartments(departmentResponse.data || []);
      setSelectedCycle((current) => current || cycleResponse.data?.[0] || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load audit module');
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async (cycleId) => {
    if (!cycleId) {
      setRecords([]);
      setSummary({ verified: 0, missing: 0, damaged: 0, mismatch: 0 });
      return;
    }

    try {
      const response = await auditService.listRecords(cycleId);
      setRecords(response.data || []);
      setSummary(response.summary || { verified: 0, missing: 0, damaged: 0, mismatch: 0 });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load audit records');
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  useEffect(() => {
    loadRecords(selectedCycle?._id);
  }, [selectedCycle]);

  const discrepancyCount = useMemo(() => summary.missing + summary.damaged + summary.mismatch, [summary]);

  const handleCreateCycle = async (values) => {
    try {
      setSubmitting(true);
      await auditService.createCycle({ ...values, department: values.department || null });
      toast.success('Audit cycle created successfully');
      setCycleModalOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to create audit cycle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRecord = async (values) => {
    if (!selectedCycle) return;
    try {
      setSubmitting(true);
      await auditService.createRecord(selectedCycle._id, values);
      toast.success('Audit record saved successfully');
      setRecordModalOpen(false);
      await loadRecords(selectedCycle._id);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save audit record');
    } finally {
      setSubmitting(false);
    }
  };

  const markCycle = async (cycle, status) => {
    try {
      await auditService.updateCycle(cycle._id, { status });
      toast.success(`Cycle marked as ${status}`);
      await loadData();
      if (selectedCycle?._id === cycle._id) {
        setSelectedCycle({ ...cycle, status });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update cycle');
    }
  };

  const handleExportPdf = async (cycleId) => {
    try {
      const token = localStorage.getItem('assetflow_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/audits/${cycleId}/export/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to export PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-cycle-${cycleId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="subtle-label">Audit governance</p>
          <h2 className="section-title mt-2">Audit Module</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Run audit cycles, capture asset verification records, and generate discrepancy visibility.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={loadData} disabled={loading}><ArrowPathIcon className="mr-2 h-4 w-4" />Refresh</Button>
          <Button onClick={() => setCycleModalOpen(true)}><PlusIcon className="mr-2 h-4 w-4" />New Cycle</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Cycles" value={cycles.length} hint="Visible audit cycles" accent />
        <StatCard label="Verified" value={summary.verified} hint="Confirmed assets" />
        <StatCard label="Discrepancies" value={discrepancyCount} hint="Missing, damaged or mismatched" />
        <StatCard label="Records" value={records.length} hint="Selected cycle entries" />
      </div>

      <div className="flex items-center gap-3">
        <CustomSelect value={filterStatus} onChange={(val) => setFilterStatus(val)} size="compact">
          <option value="">All statuses</option>
          {['Planned', 'In Progress', 'Completed', 'Cancelled'].map((value) => <option key={value} value={value}>{value}</option>)}
        </CustomSelect>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Cycle</th>
              <th className="px-5 py-4">Auditor</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Scheduled</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {cycles.length === 0 ? (
              <tr><td className="px-5 py-14 text-center text-sm text-slate-400" colSpan={6}>No audit cycles found.</td></tr>
            ) : cycles.map((cycle) => (
              <tr key={cycle._id} className="transition hover:bg-white/5">
                <td className="px-5 py-4 text-white">{cycle.title}</td>
                <td className="px-5 py-4 text-slate-300">{cycle.auditor?.name || 'Unassigned'}</td>
                <td className="px-5 py-4 text-slate-300">{cycle.department?.name || 'All departments'}</td>
                <td className="px-5 py-4"><Badge tone={cycle.status === 'Completed' ? 'success' : cycle.status === 'Cancelled' ? 'danger' : cycle.status === 'In Progress' ? 'warning' : 'info'}>{cycle.status}</Badge></td>
                <td className="px-5 py-4 text-slate-300">{formatDate(cycle.scheduledAt)}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="secondary" onClick={() => setSelectedCycle(cycle)}>View</Button>
                    {cycle.status === 'Planned' ? <Button variant="secondary" onClick={() => markCycle(cycle, 'In Progress')}>Start</Button> : null}
                    {cycle.status !== 'Completed' && cycle.status !== 'Cancelled' ? <Button variant="secondary" onClick={() => markCycle(cycle, 'Completed')}>Complete</Button> : null}
                    {cycle.status !== 'Cancelled' ? <Button variant="danger" onClick={() => markCycle(cycle, 'Cancelled')}>Cancel</Button> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCycle ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="glass-panel rounded-3xl p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="subtle-label">Selected cycle</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{selectedCycle.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{selectedCycle.description || 'No description provided'}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => handleExportPdf(selectedCycle._id)}>Export PDF</Button>
                {selectedCycle.status !== 'Completed' && selectedCycle.status !== 'Cancelled' && (
                  <Button onClick={() => setRecordModalOpen(true)}>Add Record</Button>
                )}
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Asset</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Audited at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-950/30">
                  {records.length === 0 ? (
                    <tr><td className="px-5 py-14 text-center text-sm text-slate-400" colSpan={4}>No audit records yet.</td></tr>
                  ) : records.map((record) => (
                    <tr key={record._id}>
                      <td className="px-5 py-4 text-white">{record.asset?.assetTag} - {record.asset?.name}</td>
                      <td className="px-5 py-4 text-slate-300">{record.status}</td>
                      <td className="px-5 py-4 text-slate-300">{record.locationObserved || record.asset?.location || 'Not recorded'}</td>
                      <td className="px-5 py-4 text-slate-300">{formatDate(record.auditedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5 md:p-6">
            <p className="subtle-label">Discrepancy summary</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ['Verified', summary.verified],
                ['Missing', summary.missing],
                ['Damaged', summary.damaged],
                ['Mismatch', summary.mismatch],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <AuditCycleFormModal open={cycleModalOpen} users={users} departments={departments} onClose={() => setCycleModalOpen(false)} onSubmit={handleCreateCycle} submitting={submitting} />
      <AuditRecordFormModal open={recordModalOpen} assets={assets} onClose={() => setRecordModalOpen(false)} onSubmit={handleCreateRecord} submitting={submitting} />
    </div>
  );
}
