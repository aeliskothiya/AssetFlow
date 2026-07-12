import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';
import { allocationService } from '../../services/allocationService';
import { assetService } from '../../services/assetService';
import { userService } from '../../services/userService';
import { departmentService } from '../../services/departmentService';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { AllocationFormModal } from '../../components/allocations/AllocationFormModal';

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function AssetAllocationPage() {
  const [allocations, setAllocations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allocationResponse, assetResponse, userResponse, departmentResponse] = await Promise.all([
        allocationService.list({ page: 1, limit: 50 }),
        assetService.list({ page: 1, limit: 100, status: 'Available' }),
        userService.list({ page: 1, limit: 100 }),
        departmentService.list({ page: 1, limit: 100, includeInactive: 'false' }),
      ]);
      setAllocations(allocationResponse.data || []);
      setAssets(assetResponse.data || []);
      setUsers(userResponse.data || []);
      setDepartments(departmentResponse.data || []);
      setSelectedAllocation((current) => current || allocationResponse.data?.[0] || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load allocations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableAssets = useMemo(() => assets.filter((asset) => asset.status === 'Available'), [assets]);
  const activeAllocations = useMemo(() => allocations.filter((allocation) => allocation.status === 'Active').length, [allocations]);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      await allocationService.create({ ...values, department: values.department || null });
      toast.success('Asset allocated successfully');
      setFormOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to allocate asset');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (allocation) => {
    const returnNotes = window.prompt(`Return notes for ${allocation.asset?.assetTag || 'asset'}?`, '') || '';
    try {
      await allocationService.returnAsset(allocation._id, { returnNotes });
      toast.success('Asset returned successfully');
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to return asset');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="subtle-label">Assignment control</p>
          <h2 className="section-title mt-2">Asset Allocation</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Allocate assets to people or departments and track active returns.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={loadData} disabled={loading}><ArrowPathIcon className="mr-2 h-4 w-4" />Refresh</Button>
          <Button onClick={() => setFormOpen(true)}><PlusIcon className="mr-2 h-4 w-4" />New Allocation</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Allocations" value={allocations.length} hint="Total records" accent />
        <StatCard label="Active" value={activeAllocations} hint="Currently in use" />
        <StatCard label="Available Assets" value={availableAssets.length} hint="Ready for allocation" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Asset</th>
              <th className="px-5 py-4">Allocated To</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Allocated At</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {allocations.length === 0 ? (
              <tr><td className="px-5 py-14 text-center text-sm text-slate-400" colSpan={6}>No allocations found.</td></tr>
            ) : allocations.map((allocation) => (
              <tr key={allocation._id} className="transition hover:bg-white/5">
                <td className="px-5 py-4 text-sm text-white">{allocation.asset?.assetTag} - {allocation.asset?.name}</td>
                <td className="px-5 py-4 text-sm text-slate-300">{allocation.allocatedTo?.name || 'Unassigned'}</td>
                <td className="px-5 py-4 text-sm text-slate-300">{allocation.department?.name || 'Asset department'}</td>
                <td className="px-5 py-4"><Badge tone={allocation.status === 'Active' ? 'success' : 'neutral'}>{allocation.status}</Badge></td>
                <td className="px-5 py-4 text-sm text-slate-400">{formatDate(allocation.allocatedAt)}</td>
                <td className="px-5 py-4 text-right">
                  {allocation.status === 'Active' ? (
                    <Button variant="secondary" onClick={() => handleReturn(allocation)}>Return</Button>
                  ) : (
                    <span className="text-sm text-slate-500">Closed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAllocation ? (
        <div className="glass-panel rounded-3xl p-5 md:p-6">
          <p className="subtle-label">Selected allocation</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{selectedAllocation.asset?.assetTag} - {selectedAllocation.asset?.name}</h3>
          <p className="mt-2 text-sm text-slate-400">Allocated to {selectedAllocation.allocatedTo?.name}</p>
        </div>
      ) : null}

      <AllocationFormModal open={formOpen} assets={availableAssets} users={users} departments={departments} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
