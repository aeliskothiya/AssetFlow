import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';
import { bookingService } from '../../services/bookingService';
import { assetService } from '../../services/assetService';
import { departmentService } from '../../services/departmentService';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { BookingFormModal } from '../../components/bookings/BookingFormModal';
import { useAuth } from '../../context/AuthContext';

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ResourceBookingPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingResponse, assetResponse, departmentResponse] = await Promise.all([
        bookingService.list({ page: 1, limit: 50, status: statusFilter }),
        assetService.list({ page: 1, limit: 100 }),
        departmentService.list({ page: 1, limit: 100, includeInactive: 'false' }),
      ]);
      setBookings(bookingResponse.data || []);
      setAssets((assetResponse.data || []).filter((asset) => asset.sharedBookable && !['Allocated', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'].includes(asset.status)));
      setDepartments(departmentResponse.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const activeCount = useMemo(() => bookings.filter((booking) => ['Upcoming', 'Ongoing'].includes(booking.status)).length, [bookings]);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      await bookingService.create({ ...values, department: values.department || null });
      toast.success('Booking created successfully');
      setFormOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (booking) => {
    try {
      await bookingService.remove(booking._id);
      toast.success('Booking cancelled successfully');
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to cancel booking');
    }
  };

  const handleApprove = async (booking) => {
    try {
      await bookingService.approve(booking._id);
      toast.success('Booking approved successfully');
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to approve booking');
    }
  };

  const handleRelease = async (booking) => {
    try {
      await bookingService.release(booking._id);
      toast.success('Booking released successfully');
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to release booking');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="subtle-label">Resource scheduling</p>
          <h2 className="section-title mt-2">Resource Booking</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Prevent overlapping bookings and keep shared assets available when they are not reserved.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={loadData} disabled={loading}><ArrowPathIcon className="mr-2 h-4 w-4" />Refresh</Button>
          {!['Admin', 'Asset Manager'].includes(user?.role) && (
            <Button onClick={() => setFormOpen(true)}><PlusIcon className="mr-2 h-4 w-4" />New Booking</Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Bookings" value={bookings.length} hint="All visible records" accent />
        <StatCard label="Active" value={activeCount} hint="Upcoming or ongoing" />
        <StatCard label="Bookable Assets" value={assets.length} hint="Shared resources available" />
      </div>

      <div className="flex items-center gap-3">
        <CustomSelect value={statusFilter} onChange={(val) => setStatusFilter(val)} size="compact">
          <option value="">All statuses</option>
          {['Requested', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map((value) => <option key={value} value={value}>{value}</option>)}
        </CustomSelect>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Asset</th>
              <th className="px-5 py-4">Booked By</th>
              <th className="px-5 py-4">Schedule</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {bookings.length === 0 ? (
              <tr><td className="px-5 py-14 text-center text-sm text-slate-400" colSpan={5}>No bookings found.</td></tr>
            ) : bookings.map((booking) => (
              <tr key={booking._id} className="transition hover:bg-white/5">
                <td className="px-5 py-4 text-sm text-white">{booking.asset?.assetTag} - {booking.asset?.name}</td>
                <td className="px-5 py-4 text-sm text-slate-300">{booking.bookedBy?.name || 'Unknown'}</td>
                <td className="px-5 py-4 text-sm text-slate-300">{formatDate(booking.startAt)} to {formatDate(booking.endAt)}</td>
                <td className="px-5 py-4"><Badge tone={booking.status === 'Cancelled' ? 'danger' : booking.status === 'Completed' ? 'neutral' : booking.status === 'Requested' ? 'warning' : 'success'}>{booking.status}</Badge></td>
                <td className="px-5 py-4 text-right space-x-2">
                  {booking.status === 'Requested' && ['Admin', 'Asset Manager'].includes(user?.role) && (
                    <Button variant="primary" onClick={() => handleApprove(booking)} size="sm">Approve</Button>
                  )}
                  {['Upcoming', 'Ongoing'].includes(booking.status) && user?.role === 'Employee' && (
                    <Button variant="secondary" onClick={() => handleRelease(booking)} size="sm">Release</Button>
                  )}
                  {(
                    (booking.status === 'Requested' && ['Admin', 'Asset Manager'].includes(user?.role)) ||
                    (['Requested', 'Upcoming', 'Ongoing'].includes(booking.status) && user?.role === 'Employee')
                  ) && (
                    <Button variant="secondary" onClick={() => handleCancel(booking)} size="sm">Cancel</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BookingFormModal open={formOpen} assets={assets} departments={departments} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
