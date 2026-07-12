import { PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

function formatDate(value) {
  if (!value) {
    return 'Not available';
  }

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DepartmentTable({ departments, canManage, onEdit, onDelete, onSelect }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Code</th>
              <th className="px-5 py-4">Manager</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Updated</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {departments.length === 0 ? (
              <tr>
                <td className="px-5 py-14 text-center text-sm text-slate-400" colSpan={6}>
                  No departments match the current filters.
                </td>
              </tr>
            ) : (
              departments.map((department) => (
                <tr key={department._id} className="transition hover:bg-white/5">
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onSelect(department)}
                      className="text-left font-medium text-white hover:text-cyan-200"
                    >
                      {department.name}
                    </button>
                    <p className="mt-1 max-w-xl truncate text-sm text-slate-400">
                      {department.description || 'No description provided'}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">{department.code}</td>
                  <td className="px-5 py-4 text-sm text-slate-300">
                    {department.manager?.name || 'Unassigned'}
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={department.isActive ? 'success' : 'danger'}>
                      {department.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400">{formatDate(department.updatedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => onSelect(department)}>
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      {canManage ? (
                        <>
                          <Button variant="secondary" onClick={() => onEdit(department)}>
                            <PencilSquareIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="danger" onClick={() => onDelete(department)}>
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
