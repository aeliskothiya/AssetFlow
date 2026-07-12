import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from '../utils/formatters';

export function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        // Using fetch directly as we might not have a dedicated service file for activities on frontend
        const token = localStorage.getItem('assetflow_token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/activities/logs?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setLogs(data.data);
          setTotalPages(data.pagination.totalPages);
        } else {
          toast.error(data.message || 'Failed to load logs');
        }
      } catch (error) {
        toast.error('Failed to load logs');
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">Activity Logs</h2>
        <p className="mt-2 text-sm text-slate-400">System-wide audit trail of actions performed.</p>
      </div>
      <div className="glass-panel rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Entity Type</th>
                <th className="px-5 py-4">Details</th>
                <th className="px-5 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr><td className="px-5 py-14 text-center text-sm text-slate-400" colSpan={5}>Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td className="px-5 py-14 text-center text-sm text-slate-400" colSpan={5}>No activity logs found.</td></tr>
              ) : logs.map((log) => (
                <tr key={log._id} className="transition hover:bg-white/5">
                  <td className="px-5 py-4 font-medium text-white">{log.action}</td>
                  <td className="px-5 py-4 text-slate-300">{log.user?.name} ({log.user?.role})</td>
                  <td className="px-5 py-4 text-slate-300">{log.entityType}</td>
                  <td className="px-5 py-4 text-slate-300">{log.details}</td>
                  <td className="px-5 py-4 text-slate-400">{formatDistanceToNow(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center text-sm text-slate-400">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
