import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PlusIcon, ArrowPathIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { categoryService } from '../../services/categoryService';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { CategoryFormModal } from '../../components/categories/CategoryFormModal';

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function AssetCategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchDraft.trim());
      setPagination((current) => ({ ...current, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDraft]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.list({
        page: pagination.page,
        limit: pagination.limit,
        search,
        includeInactive: String(includeInactive),
      });
      setCategories(response.data || []);
      setPagination((current) => ({ ...current, ...response.pagination }));
      setSelectedCategory((current) => current || response.data?.[0] || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load asset categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [pagination.page, pagination.limit, search, includeInactive]);

  const openCreate = () => {
    setFormMode('create');
    setEditingCategory(null);
    setFormOpen(true);
  };

  const openEdit = (category) => {
    setFormMode('edit');
    setEditingCategory(category);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = { ...values, isActive: values.isActive === true || values.isActive === 'true' };
      if (formMode === 'edit' && editingCategory) {
        await categoryService.update(editingCategory._id, payload);
        toast.success('Category updated successfully');
      } else {
        await categoryService.create(payload);
        toast.success('Category created successfully');
      }
      closeForm();
      await loadCategories();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Deactivate ${category.name}?`)) return;
    try {
      await categoryService.remove(category._id);
      toast.success('Category deactivated successfully');
      await loadCategories();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to deactivate category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="subtle-label">Inventory taxonomy</p>
          <h2 className="section-title mt-2">Asset Category Management</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Create reusable categories that drive asset registration and reporting.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={loadCategories} disabled={loading}><ArrowPathIcon className="mr-2 h-4 w-4" />Refresh</Button>
          <Button onClick={openCreate}><PlusIcon className="mr-2 h-4 w-4" />New Category</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Visible Categories" value={pagination.total} hint="Matching current filters" accent />
        <StatCard label="Active" value={categories.filter((category) => category.isActive).length} hint="Available for registration" />
        <StatCard label="Inactive" value={categories.filter((category) => !category.isActive).length} hint="Hidden from default lists" />
      </div>

      <div className="glass-panel rounded-3xl p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15 md:max-w-xl"
          />
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            <input type="checkbox" checked={includeInactive} onChange={(event) => setIncludeInactive(event.target.checked)} className="h-4 w-4" />
            Include inactive
          </label>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Icon</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Updated</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/30">
              {categories.length === 0 ? (
                <tr><td className="px-5 py-14 text-center text-sm text-slate-400" colSpan={5}>No categories found.</td></tr>
              ) : categories.map((category) => (
                <tr key={category._id} className="transition hover:bg-white/5">
                  <td className="px-5 py-4">
                    <button type="button" onClick={() => setSelectedCategory(category)} className="text-left font-medium text-white hover:text-cyan-200">
                      {category.name}
                    </button>
                    <p className="mt-1 text-sm text-slate-400">{category.description || 'No description provided'}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">{category.icon || 'Not set'}</td>
                  <td className="px-5 py-4"><Badge tone={category.isActive ? 'success' : 'danger'}>{category.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-5 py-4 text-sm text-slate-400">{formatDate(category.updatedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => openEdit(category)}><PencilSquareIcon className="h-4 w-4" /></Button>
                      <Button variant="danger" onClick={() => handleDelete(category)}><TrashIcon className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-5 md:p-6">
        <p className="subtle-label">Selected category</p>
        {selectedCategory ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold text-white">{selectedCategory.name}</h3>
              <p className="mt-2 text-sm text-slate-400">{selectedCategory.description || 'No description provided'}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Icon</p><p className="mt-2 text-sm text-white">{selectedCategory.icon || 'Not set'}</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p><p className="mt-2 text-sm text-white">{selectedCategory.isActive ? 'Active' : 'Inactive'}</p></div>
            </div>
          </div>
        ) : <p className="mt-4 text-sm text-slate-400">Select a category to inspect it.</p>}
      </div>

      <CategoryFormModal open={formOpen} mode={formMode} initialValues={editingCategory} onClose={closeForm} onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
