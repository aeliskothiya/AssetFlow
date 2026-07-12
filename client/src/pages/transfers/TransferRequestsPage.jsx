import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';
import { transferService } from '../../services/transferService';
import { assetService } from '../../services/assetService';
import { departmentService } from '../../services/departmentService';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Badge } from '../../components/ui/Badge';
import { TransferFormModal } from '../../components/transfers/TransferFormModal';
import { useAuth } from '../../context/AuthContext';

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function TransferRequestsPage() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [transferResponse, assetResponse, departmentResponse] = await Promise.all([
        transferService.list({ page: 1, limit: 50, status: statusFilter }),
        assetService.list({ page: 1, limit: 100 }),
        departmentService.list({ page: 1, limit: 100, includeInactive: 'false' }),
      ]);
      setTransfers(transferResponse.data || []);
      setAssets((assetResponse.data || []).filter(asset => asset.status === 'Available'));
      setDepartments(departmentResponse.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load transfer requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const requestedCount = useMemo(() => transfers.filter((transfer) => transfer.status === 'Requested').length, [transfers]);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      await transferService.create(values);
      toast.success('Transfer request submitted successfully');
      setFormOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to submit transfer request');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (transfer, status) => {
    try {
      await transferService.updateStatus(transfer._id, status);
      toast.success(`Transfer marked as ${status}`);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update transfer status');
    }
  };

  const isManager = ['Admin', 'Asset Manager', 'Department Head'].includes(user?.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="subtle-label">Asset mobility</p>
          <h2 className="section-title mt-2">Transfer Requests</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Manage asset reallocations between departments and locations.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={loadData} disabled={loading}><ArrowPathIcon className="mr-2 h-4 w-4" />Refresh</Button>
          <Button onClick={() => setFormOpen(true)}><PlusIcon className="mr-2 h-4 w-4" />New Transfer</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Requests" value={transfers.length} hint="All visible transfers" accent />
        <StatCard label="Pending" value={requestedCount} hint="Awaiting approval" />
        <StatCard label="Completed" value={transfers.filter((t) => t.status === 'Completed').length} hint="Successfully transferred" />
      </div>

      <div className="flex items-center gap-3">
        <CustomSelect value={statusFilter} onChange={(val) => setStatusFilter(val)} size="compact">
          <option value="">All statuses</option>
          {['Requested', 'Approved', 'Rejected', 'Completed', 'Cancelled'].map((value) => <option key={value} value={value}>{value}</option>)}
        </CustomSelect>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Asset</th>
              <th className="px-5 py-4">From</th>
              <th className="px-5 py-4">To</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Requested By</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {transfers.length === 0 ? (
              <tr><td className="px-5 py-14 text-center text-sm text-slate-400" colSpan={6}>No transfer requests found.</td></tr>
            ) : transfers.map((transfer) => (
              <tr key={transfer._id} className="transition hover:bg-white/5">
                <td className="px-5 py-4 text-sm text-white">{transfer.asset?.assetTag} - {transfer.asset?.name}</td>
                <td className="px-5 py-4 text-sm text-slate-300">{transfer.fromDepartment?.name || 'Unassigned'}</td>
                <td className="px-5 py-4 text-sm text-slate-300">{transfer.toDepartment?.name || 'Unknown'}</td>
                <td className="px-5 py-4"><Badge tone={transfer.status === 'Requested' ? 'warning' : transfer.status === 'Approved' ? 'info' : transfer.status === 'Completed' ? 'success' : 'danger'}>{transfer.status}</Badge></td>
                <td className="px-5 py-4 text-sm text-slate-300">{transfer.requestedBy?.name || 'Unknown'}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    {transfer.status === 'Requested' && isManager && (
                      <>
                        <Button variant="secondary" onClick={() => updateStatus(transfer, 'Approved')}>Approve</Button>
                        <Button variant="danger" onClick={() => updateStatus(transfer, 'Rejected')}>Reject</Button>
                      </>
                    )}
                    {transfer.status === 'Approved' && isManager && (
                      <Button variant="secondary" onClick={() => updateStatus(transfer, 'Completed')}>Complete</Button>
                    )}
                    {transfer.status === 'Requested' && !isManager && transfer.requestedBy?._id === user?.id && (
                      <Button variant="danger" onClick={() => updateStatus(transfer, 'Cancelled')}>Cancel</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TransferFormModal open={formOpen} assets={assets} departments={departments} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
