import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

export function AllocationFormModal({ open, assets, users, departments, onClose, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      asset: '',
      allocatedTo: '',
      department: '',
      purpose: '',
      notes: '',
      expectedReturnDate: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ asset: '', allocatedTo: '', department: '', purpose: '', notes: '', expectedReturnDate: '' });
    }
  }, [open, reset]);

  return (
    <Modal
      open={open}
      title="Allocate Asset"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="allocation-form" disabled={submitting}>
            Allocate asset
          </Button>
        </>
      }
    >
      <form id="allocation-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <Select label="Asset" error={errors.asset?.message} {...register('asset', { required: 'Asset is required' })}>
          <option value="">Select asset</option>
          {assets.map((asset) => (
            <option key={asset._id} value={asset._id}>
              {asset.assetTag} - {asset.name}
            </option>
          ))}
        </Select>
        <Select label="Allocate to user" error={errors.allocatedTo?.message} {...register('allocatedTo', { required: 'User is required' })}>
          <option value="">Select user</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.email})
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
        <Input label="Purpose" error={errors.purpose?.message} {...register('purpose')} />
        <Input label="Expected Return Date" type="date" error={errors.expectedReturnDate?.message} {...register('expectedReturnDate')} />
        <div className="md:col-span-2">
          <Textarea label="Notes" error={errors.notes?.message} {...register('notes')} />
        </div>
      </form>
    </Modal>
  );
}
