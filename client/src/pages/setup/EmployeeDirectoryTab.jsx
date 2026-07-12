import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowPathIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/userService';
import { Button } from '../../components/ui/Button';
import { CustomSelect } from '../../components/ui/CustomSelect';

export function EmployeeDirectoryTab() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await userService.list({ limit: 100 });
      setEmployees(response.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleUpdateRole = async () => {
    if (!editingEmployee || !newRole) return;
    try {
      setSubmitting(true);
      await userService.updateRole(editingEmployee._id, newRole);
      toast.success('Role updated successfully');
      setEditingEmployee(null);
      loadEmployees();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <h3 className="text-lg font-semibold text-white">Employee Directory</h3>
        <Button variant="secondary" onClick={loadEmployees} disabled={loading}>
          <ArrowPathIcon className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading directory...</div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No employees found.</div>
        ) : (
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
              <tr>
                <th className="px-5 py-4 font-semibold">Name</th>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">Department</th>
                <th className="px-5 py-4 font-semibold">Role</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {employees.map((emp) => (
                <tr
                  key={emp._id}
                  className="transition hover:bg-white/5"
                >
                  <td className="px-5 py-4 text-sm font-medium text-white">{emp.name}</td>
                  <td className="px-5 py-4 text-sm text-slate-300">{emp.email}</td>
                  <td className="px-5 py-4 text-sm text-slate-300">{emp.department?.name || '—'}</td>
                  <td className="px-5 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      emp.role === 'Admin' ? 'border-purple-400/20 bg-purple-400/10 text-purple-300' :
                      emp.role === 'Asset Manager' ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300' :
                      emp.role === 'Department Head' ? 'border-amber-400/20 bg-amber-400/10 text-amber-300' :
                      'border-slate-400/20 bg-slate-400/10 text-slate-300'
                    }`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">{emp.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-5 py-4 text-right">
                    {emp.role !== 'Admin' && (
                      <button
                        onClick={() => { setEditingEmployee(emp); setNewRole(emp.role); }}
                        className="inline-flex items-center justify-center rounded-xl p-2 text-slate-400 transition hover:bg-cyan-400/10 hover:text-cyan-300 focus:outline-none"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white">Update Role</h3>
            <p className="mt-2 text-sm text-slate-400">
              Assign a new role to <span className="font-medium text-white">{editingEmployee.name}</span>.
            </p>
            
            <div className="mt-6 space-y-4">
              <div>
                <CustomSelect
                  value={newRole}
                  onChange={(val) => setNewRole(val)}
                  label="Role"
                >
                  <option value="Employee">Employee</option>
                  <option value="Department Head">Department Head</option>
                  <option value="Asset Manager">Asset Manager</option>
                </CustomSelect>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setEditingEmployee(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRole} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Role'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
