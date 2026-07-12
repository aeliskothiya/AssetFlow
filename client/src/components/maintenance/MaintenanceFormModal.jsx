import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

export function MaintenanceFormModal({ open, assets, users, departments, onClose, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      asset: '',
      issueDescription: '',
      department: '',
      priority: 'Medium',
      scheduledAt: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ asset: '', issueDescription: '', department: '', priority: 'Medium', scheduledAt: '' });
    }
  }, [open, reset]);

  return (
    <Modal
      open={open}
      title="Create Maintenance Request"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="maintenance-form" disabled={submitting}>
            Create request
          </Button>
        </>
      }
    >
      <form id="maintenance-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <Select label="Asset" error={errors.asset?.message} {...register('asset', { required: 'Asset is required' })}>
          <option value="">Select asset</option>
          {assets.map((asset) => (
            <option key={asset._id} value={asset._id}>
              {asset.assetTag} - {asset.name}
            </option>
          ))}
        </Select>
        <Select label="Department" error={errors.department?.message} {...register('department')}>
          <option value="">Use asset department</option>
          {departments.map((department) => (
            <option key={department._id} value={department._id}>
              {department.name}
            </option>
          ))}
        </Select>
        <Select label="Priority" error={errors.priority?.message} {...register('priority')}>
          {['Low', 'Medium', 'High', 'Critical'].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <Input label="Scheduled at" type="datetime-local" error={errors.scheduledAt?.message} {...register('scheduledAt')} />
        <div className="md:col-span-2">
          <Textarea label="Issue description" error={errors.issueDescription?.message} {...register('issueDescription', { required: 'Issue description is required' })} />
        </div>
      </form>
    </Modal>
  );
}
