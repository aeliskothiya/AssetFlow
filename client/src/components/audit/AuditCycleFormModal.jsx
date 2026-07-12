import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

export function AuditCycleFormModal({ open, users, departments, initialValues, onClose, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      department: '',
      auditor: '',
      scheduledAt: '',
      notes: '',
      status: 'Planned',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: initialValues?.title || '',
        description: initialValues?.description || '',
        department: initialValues?.department?._id || initialValues?.department || '',
        auditor: initialValues?.auditor?._id || initialValues?.auditor || '',
        scheduledAt: initialValues?.scheduledAt ? String(initialValues.scheduledAt).slice(0, 16) : '',
        notes: initialValues?.notes || '',
        status: initialValues?.status || 'Planned',
      });
    }
  }, [open, initialValues, reset]);

  return (
    <Modal
      open={open}
      title={initialValues ? 'Edit Audit Cycle' : 'Create Audit Cycle'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" form="audit-cycle-form" disabled={submitting}>
            {initialValues ? 'Save changes' : 'Create cycle'}
          </Button>
        </>
      }
    >
      <form id="audit-cycle-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <Input label="Title" error={errors.title?.message} {...register('title', { required: 'Title is required' })} />
        <Select label="Status" error={errors.status?.message} {...register('status')}>
          {['Planned', 'In Progress', 'Completed', 'Cancelled'].map((value) => <option key={value} value={value}>{value}</option>)}
        </Select>
        <div className="md:col-span-2">
          <Textarea label="Description" error={errors.description?.message} {...register('description')} />
        </div>
        <Select label="Department" error={errors.department?.message} {...register('department')}>
          <option value="">All departments</option>
          {departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}
        </Select>
        <Select label="Auditor" error={errors.auditor?.message} {...register('auditor', { required: 'Auditor is required' })}>
          <option value="">Select auditor</option>
          {users.map((user) => <option key={user._id} value={user._id}>{user.name} ({user.role})</option>)}
        </Select>
        <Input label="Scheduled at" type="datetime-local" error={errors.scheduledAt?.message} {...register('scheduledAt', { required: 'Scheduled date is required' })} />
        <div className="md:col-span-2">
          <Textarea label="Notes" error={errors.notes?.message} {...register('notes')} />
        </div>
      </form>
    </Modal>
  );
}
