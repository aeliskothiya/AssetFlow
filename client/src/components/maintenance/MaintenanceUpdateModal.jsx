import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

export function MaintenanceUpdateModal({ open, users, initialValues, onClose, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      status: 'Pending',
      technician: '',
      assignedBy: '',
      scheduledAt: '',
      resolutionNotes: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        status: initialValues?.status || 'Pending',
        technician: initialValues?.technician?._id || initialValues?.technician || '',
        assignedBy: initialValues?.assignedBy?._id || initialValues?.assignedBy || '',
        scheduledAt: initialValues?.scheduledAt ? String(initialValues.scheduledAt).slice(0, 16) : '',
        resolutionNotes: initialValues?.resolutionNotes || '',
      });
    }
  }, [open, initialValues, reset]);

  return (
    <Modal
      open={open}
      title="Update Maintenance"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="maintenance-update-form" disabled={submitting}>
            Save changes
          </Button>
        </>
      }
    >
      <form id="maintenance-update-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <Select label="Status" error={errors.status?.message} {...register('status')}>
          {['Pending', 'Approved', 'Rejected', 'Technician Assigned', 'In Progress', 'Resolved'].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </Select>
        <Select label="Technician" error={errors.technician?.message} {...register('technician')}>
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.role})
            </option>
          ))}
        </Select>
        <Select label="Assigned by" error={errors.assignedBy?.message} {...register('assignedBy')}>
          <option value="">Not set</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.role})
            </option>
          ))}
        </Select>
        <Input label="Scheduled at" type="datetime-local" error={errors.scheduledAt?.message} {...register('scheduledAt')} />
        <div className="md:col-span-2">
          <Textarea label="Resolution notes" error={errors.resolutionNotes?.message} {...register('resolutionNotes')} />
        </div>
      </form>
    </Modal>
  );
}
