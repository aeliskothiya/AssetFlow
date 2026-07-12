import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { departmentService } from '../../services/departmentService';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { DepartmentFormModal } from '../../components/departments/DepartmentFormModal';
import { DepartmentTable } from '../../components/departments/DepartmentTable';

const PAGE_SIZE = 8;

export function DepartmentManagementPage() {
  const { user } = useAuth();
  const canManage = ['Admin', 'Asset Manager'].includes(user?.role);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchDraft.trim());
      setPagination((current) => ({ ...current, page: 1 }));
    }, 350);

    return () => clearTimeout(timer);
  }, [searchDraft]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoading(true);
        const response = await departmentService.list({
          page: pagination.page,
          limit: pagination.limit,
          search,
          includeInactive: String(includeInactive),
        });
        setDepartments(response.data || []);
        setPagination((current) => ({
          ...current,
          ...response.pagination,
        }));
        if (!selectedDepartment && response.data?.length) {
          setSelectedDepartment(response.data[0]);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load departments');
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, [pagination.page, pagination.limit, search, includeInactive]);

  useEffect(() => {
    if (!selectedDepartment && departments.length > 0) {
      setSelectedDepartment(departments[0]);
    }
  }, [departments, selectedDepartment]);

  const activeCount = useMemo(
    () => departments.filter((department) => department.isActive).length,
    [departments]
  );
  const inactiveCount = departments.length - activeCount;

  const chartData = [
    { name: 'Active', value: activeCount },
    { name: 'Inactive', value: inactiveCount },
  ];

  const openCreate = () => {
    setFormMode('create');
    setEditingDepartment(null);
    setFormOpen(true);
  };

  const openEdit = (department) => {
    setFormMode('edit');
    setEditingDepartment(department);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingDepartment(null);
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        ...values,
        isActive: values.isActive === true || values.isActive === 'true',
      };

      if (formMode === 'edit' && editingDepartment) {
        await departmentService.update(editingDepartment._id, payload);
        toast.success('Department updated successfully');
      } else {
        await departmentService.create(payload);
        toast.success('Department created successfully');
      }

      closeForm();
      setPagination((current) => ({ ...current, page: 1 }));
      const response = await departmentService.list({
        page: 1,
        limit: pagination.limit,
        search,
        includeInactive: String(includeInactive),
      });
      setDepartments(response.data || []);
      setPagination((current) => ({
        ...current,
        ...response.pagination,
      }));
      setSelectedDepartment(response.data?.[0] || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (department) => {
    const confirmed = window.confirm(`Deactivate ${department.name}?`);
    if (!confirmed) {
      return;
    }

    try {
      await departmentService.remove(department._id);
      toast.success('Department deactivated successfully');
      const response = await departmentService.list({
        page: pagination.page,
        limit: pagination.limit,
        search,
        includeInactive: String(includeInactive),
      });
      setDepartments(response.data || []);
      setPagination((current) => ({
        ...current,
        ...response.pagination,
      }));
      setSelectedDepartment(response.data?.[0] || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to deactivate department');
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await departmentService.list({
        page: pagination.page,
        limit: pagination.limit,
        search,
        includeInactive: String(includeInactive),
      });
      setDepartments(response.data || []);
      setPagination((current) => ({
        ...current,
        ...response.pagination,
      }));
      setSelectedDepartment(response.data?.[0] || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to refresh departments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="subtle-label">Department operations</p>
          <h2 className="section-title mt-2">Department Management</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Create, update, deactivate, and inspect departments with role-based access control.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleRefresh} disabled={loading}>
            <ArrowPathIcon className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canManage ? (
            <Button onClick={openCreate}>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Department
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visible Departments" value={pagination.total} hint="Matches current filters" accent />
        <StatCard label="Active Departments" value={activeCount} hint="Operational and available" />
        <StatCard label="Inactive Departments" value={inactiveCount} hint="Soft-deactivated records" />
        <StatCard label="Access Level" value={user?.role || 'Employee'} hint="Current signed-in role" />
      </div>

      <div className="space-y-6">
        <div className="space-y-6 min-w-0">
          <div className="glass-panel rounded-3xl p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Search and filters</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Find departments by name, code, or description.
                </p>
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={includeInactive}
                  onChange={(event) => {
                    setIncludeInactive(event.target.checked);
                    setPagination((current) => ({ ...current, page: 1 }));
                  }}
                  className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-cyan-400/20"
                />
                Include inactive records
              </label>
            </div>
            <div className="mt-4">
              <input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search departments by name or code..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15"
              />
            </div>
          </div>

          <DepartmentTable
            departments={departments}
            canManage={canManage}
            onEdit={openEdit}
            onDelete={handleDelete}
            onSelect={setSelectedDepartment}
          />

          <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={pagination.page <= 1 || loading}
                onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DepartmentFormModal
        open={formOpen}
        mode={formMode}
        initialValues={editingDepartment}
        onClose={closeForm}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}
