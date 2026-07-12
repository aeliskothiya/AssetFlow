import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';
import { maintenanceService } from '../../services/maintenanceService';
import { assetService } from '../../services/assetService';
import { userService } from '../../services/userService';
import { departmentService } from '../../services/departmentService';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { MaintenanceFormModal } from '../../components/maintenance/MaintenanceFormModal';
import { MaintenanceUpdateModal } from '../../components/maintenance/MaintenanceUpdateModal';

function formatDate(value) {
  if (!value) return 'Not scheduled';
  return new Date(value).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function MaintenanceModulePage() {
  const [maintenanceItems, setMaintenanceItems] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [maintenanceResponse, assetResponse, userResponse, departmentResponse] = await Promise.all([
        maintenanceService.list({ page: 1, limit: 50, status: statusFilter }),
        assetService.list({ page: 1, limit: 100 }),
        userService.list({ page: 1, limit: 100 }),
        departmentService.list({ page: 1, limit: 100, includeInactive: 'false' }),
      ]);
      setMaintenanceItems(maintenanceResponse.data || []);
      setAssets((assetResponse.data || []).filter((asset) => !['Retired', 'Disposed'].includes(asset.status)));
      setUsers(userResponse.data || []);
      setDepartments(departmentResponse.data || []);
      setSelectedItem((current) => current || maintenanceResponse.data?.[0] || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const pendingCount = useMemo(() => maintenanceItems.filter((item) => item.status === 'Pending').length, [maintenanceItems]);
  const activeCount = useMemo(() => maintenanceItems.filter((item) => ['Approved', 'Technician Assigned', 'In Progress'].includes(item.status)).length, [maintenanceItems]);

  const handleCreate = async (values) => {
    try {
      setSubmitting(true);
      await maintenanceService.create({ ...values, department: values.department || null, scheduledAt: values.scheduledAt || null });
      toast.success('Maintenance request created successfully');
      setCreateOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to create maintenance request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (values) => {
    try {
      setSubmitting(true);
      await maintenanceService.update(selectedItem._id, {
        ...values,
        technician: values.technician || null,
        assignedBy: values.assignedBy || null,
        scheduledAt: values.scheduledAt || null,
      });
      toast.success('Maintenance updated successfully');
      setUpdateOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update maintenance');
    } finally {
      setSubmitting(false);
    }
  };

  const quickUpdate = async (item, status) => {
    try {
      await maintenanceService.update(item._id, { status });
      toast.success(`Maintenance marked as ${status}`);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update maintenance status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="subtle-label">Service workflow</p>
          <h2 className="section-title mt-2">Maintenance Module</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Track maintenance requests from issue reporting through resolution and asset status updates.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={loadData} disabled={loading}><ArrowPathIcon className="mr-2 h-4 w-4" />Refresh</Button>
          <Button onClick={() => setCreateOpen(true)}><PlusIcon className="mr-2 h-4 w-4" />New Request</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Requests" value={maintenanceItems.length} hint="Visible records" accent />
        <StatCard label="Pending" value={pendingCount} hint="Awaiting review" />
        <StatCard label="Active Work" value={activeCount} hint="Approved or in progress" />
      </div>

      <div className="flex items-center gap-3">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none">
          <option value="">All statuses</option>
          {['Pending', 'Approved', 'Rejected', 'Technician Assigned', 'In Progress', 'Resolved'].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Asset</th>
              <th className="px-5 py-4">Issue</th>
              <th className="px-5 py-4">Priority</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Scheduled</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {maintenanceItems.length === 0 ? (
              <tr><td className="px-5 py-14 text-center text-sm text-slate-400" colSpan={6}>No maintenance requests found.</td></tr>
            ) : maintenanceItems.map((item) => (
              <tr key={item._id} className="transition hover:bg-white/5">
                <td className="px-5 py-4 text-sm text-white">{item.asset?.assetTag} - {item.asset?.name}</td>
                <td className="px-5 py-4 text-sm text-slate-300 max-w-xs">{item.issueDescription}</td>
                <td className="px-5 py-4 text-sm text-slate-300">{item.priority}</td>
                <td className="px-5 py-4"><Badge tone={item.status === 'Rejected' ? 'danger' : item.status === 'Resolved' ? 'success' : item.status === 'Pending' ? 'warning' : 'info'}>{item.status}</Badge></td>
                <td className="px-5 py-4 text-sm text-slate-300">{formatDate(item.scheduledAt)}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="secondary" onClick={() => { setSelectedItem(item); setUpdateOpen(true); }}>Update</Button>
                    {item.status === 'Pending' ? <Button variant="secondary" onClick={() => quickUpdate(item, 'Approved')}>Approve</Button> : null}
                    {item.status === 'Approved' ? <Button variant="secondary" onClick={() => quickUpdate(item, 'Technician Assigned')}>Assign</Button> : null}
                    {item.status === 'Technician Assigned' || item.status === 'Approved' ? <Button variant="secondary" onClick={() => quickUpdate(item, 'In Progress')}>Start</Button> : null}
                    {item.status === 'In Progress' ? <Button variant="secondary" onClick={() => quickUpdate(item, 'Resolved')}>Resolve</Button> : null}
                    {item.status === 'Pending' ? <Button variant="danger" onClick={() => quickUpdate(item, 'Rejected')}>Reject</Button> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedItem ? (
        <div className="glass-panel rounded-3xl p-5 md:p-6">
          <p className="subtle-label">Selected request</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{selectedItem.asset?.assetTag} - {selectedItem.asset?.name}</h3>
          <p className="mt-2 text-sm text-slate-400">{selectedItem.issueDescription}</p>
        </div>
      ) : null}

      <MaintenanceFormModal open={createOpen} assets={assets} users={users} departments={departments} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} submitting={submitting} />
      <MaintenanceUpdateModal open={updateOpen} users={users} initialValues={selectedItem} onClose={() => setUpdateOpen(false)} onSubmit={handleUpdate} submitting={submitting} />
    </div>
  );
}
