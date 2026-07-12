import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

export function TransferFormModal({ open, assets, departments, onClose, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      asset: '',
      toDepartment: '',
      reason: '',
      priority: 'Medium',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ asset: '', toDepartment: '', reason: '', priority: 'Medium' });
    }
  }, [open, reset]);

  return (
    <Modal
      open={open}
      title="Request Asset Transfer"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="transfer-form" disabled={submitting}>
            Submit Request
          </Button>
        </>
      }
    >
      <form id="transfer-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <Select label="Asset" error={errors.asset?.message} {...register('asset', { required: 'Asset is required' })}>
          <option value="">Select asset</option>
          {assets.map((asset) => (
            <option key={asset._id} value={asset._id}>
              {asset.assetTag} - {asset.name}
            </option>
          ))}
        </Select>
        <Select label="Target Department" error={errors.toDepartment?.message} {...register('toDepartment', { required: 'Target department is required' })}>
          <option value="">Select department</option>
          {departments.map((department) => (
            <option key={department._id} value={department._id}>
              {department.name}
            </option>
          ))}
        </Select>
        <div className="md:col-span-2">
          <Select label="Priority" error={errors.priority?.message} {...register('priority')}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Textarea label="Reason for transfer" error={errors.reason?.message} {...register('reason', { required: 'Reason is required' })} />
        </div>
      </form>
    </Modal>
  );
}
