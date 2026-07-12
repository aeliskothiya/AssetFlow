import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowPathIcon, PlusIcon, PencilSquareIcon, TrashIcon, CubeIcon } from '@heroicons/react/24/outline';
import { assetService } from '../../services/assetService';
import { categoryService } from '../../services/categoryService';
import { departmentService } from '../../services/departmentService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { AssetFormModal } from '../../components/assets/AssetFormModal';

const parseMedia = (text) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [url, publicId] = line.split('|').map((segment) => segment.trim());
      return { url, publicId };
    })
    .filter((item) => item.url && item.publicId);

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const getAssetImageUrl = (asset) => asset.images?.[0]?.url || asset.photo || '';

export function AssetRegistrationPage() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editingAsset, setEditingAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchDraft.trim());
      setPagination((current) => ({ ...current, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDraft]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetResponse, categoryResponse, departmentResponse] = await Promise.all([
        assetService.list({ page: pagination.page, limit: pagination.limit, search, status }),
        categoryService.list({ page: 1, limit: 100, includeInactive: 'false' }),
        departmentService.list({ page: 1, limit: 100, includeInactive: 'false' }),
      ]);
      setAssets(assetResponse.data || []);
      setCategories(categoryResponse.data || []);
      setDepartments(departmentResponse.data || []);
      setPagination((current) => ({ ...current, ...assetResponse.pagination }));
      setSelectedAsset((current) => current || assetResponse.data?.[0] || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pagination.page, pagination.limit, search, status]);

  const openCreate = () => {
    setFormMode('create');
    setEditingAsset(null);
    setFormOpen(true);
  };

  const openEdit = (asset) => {
    setFormMode('edit');
    setEditingAsset(asset);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingAsset(null);
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        ...values,
        purchaseCost: Number(values.purchaseCost),
        sharedBookable: values.sharedBookable === true || values.sharedBookable === 'true',
        department: values.department || null,
        images: parseMedia(values.imagesText || ''),
        documents: parseMedia(values.documentsText || ''),
      };
      delete payload.imagesText;
      delete payload.documentsText;

      let submitData = payload;
      let headers = {};
      
      if (values.photo && values.photo.length > 0) {
        submitData = new FormData();
        submitData.append('photo', values.photo[0]);
        Object.keys(payload).forEach((key) => {
          if (key === 'images' || key === 'documents') {
            submitData.append(key, JSON.stringify(payload[key]));
          } else if (payload[key] !== null && payload[key] !== undefined) {
            submitData.append(key, payload[key]);
          }
        });
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      if (formMode === 'edit' && editingAsset) {
        await assetService.update(editingAsset._id, submitData);
        toast.success('Asset updated successfully');
      } else {
        await assetService.create(submitData);
        toast.success('Asset registered successfully');
      }

      closeForm();
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save asset');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (asset) => {
    if (!window.confirm(`Dispose ${asset.assetTag}?`)) return;
    try {
      await assetService.remove(asset._id);
      toast.success('Asset disposed successfully');
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to dispose asset');
    }
  };

  const availableCount = useMemo(() => assets.filter((asset) => asset.status === 'Available').length, [assets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="subtle-label">Asset lifecycle</p>
          <h2 className="section-title mt-2">Asset Registration Module</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Register inventory with automatic asset tags, category classification, and status control.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={loadData} disabled={loading}><ArrowPathIcon className="mr-2 h-4 w-4" />Refresh</Button>
          <Button onClick={openCreate}><PlusIcon className="mr-2 h-4 w-4" />New Asset</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Assets" value={pagination.total} hint="Registered inventory" accent />
        <StatCard label="Available" value={availableCount} hint="Ready for allocation or booking" />
        <StatCard label="Reserved" value={assets.filter((asset) => asset.status === 'Reserved').length} hint="Booked resources" />
        <StatCard label="Allocated" value={assets.filter((asset) => asset.status === 'Allocated').length} hint="Assigned to users" />
      </div>

      <div className="glass-panel rounded-3xl p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search asset tag, serial number, name, or location..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15 md:max-w-2xl"
          />
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPagination((current) => ({ ...current, page: 1 }));
            }}
            className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">All statuses</option>
            {['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Asset</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Updated</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/30">
              {assets.length === 0 ? (
                <tr><td className="px-5 py-14 text-center text-sm text-slate-400" colSpan={6}>No assets found.</td></tr>
              ) : assets.map((asset) => (
                <tr key={asset._id} className="transition hover:bg-white/5">
                  <td className="px-5 py-4 flex items-center gap-3">
                    {getAssetImageUrl(asset) ? (
                      <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${getAssetImageUrl(asset)}`} alt={asset.name} className="h-10 w-10 rounded-lg object-cover bg-white/5 border border-white/10" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400">
                        <CubeIcon className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <button type="button" onClick={() => setSelectedAsset(asset)} className="text-left font-medium text-white hover:text-cyan-200">
                        {asset.assetTag} - {asset.name}
                      </button>
                      <p className="mt-1 text-sm text-slate-400">SN {asset.serialNumber}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">{asset.category?.name || 'Unassigned'}</td>
                  <td className="px-5 py-4"><Badge tone={asset.status === 'Available' ? 'success' : asset.status === 'Under Maintenance' ? 'warning' : asset.status === 'Disposed' ? 'danger' : 'info'}>{asset.status}</Badge></td>
                  <td className="px-5 py-4 text-sm text-slate-300">{asset.department?.name || 'Unassigned'}</td>
                  <td className="px-5 py-4 text-sm text-slate-400">{formatDate(asset.updatedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => openEdit(asset)}><PencilSquareIcon className="h-4 w-4" /></Button>
                      <Button variant="danger" onClick={() => handleDelete(asset)}><TrashIcon className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-5 md:p-6">
        <p className="subtle-label">Selected asset</p>
        {selectedAsset ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-semibold text-white">{selectedAsset.assetTag} - {selectedAsset.name}</h3>
              <p className="mt-2 text-sm text-slate-400">{selectedAsset.notes || 'No notes provided'}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:col-span-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p><p className="mt-2 text-sm text-white">{selectedAsset.status}</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Bookable</p><p className="mt-2 text-sm text-white">{selectedAsset.sharedBookable ? 'Yes' : 'No'}</p></div>
            </div>
          </div>
        ) : <p className="mt-4 text-sm text-slate-400">Select an asset to inspect it.</p>}
      </div>

      <AssetFormModal open={formOpen} mode={formMode} initialValues={editingAsset} categories={categories} departments={departments} onClose={closeForm} onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
