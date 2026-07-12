import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

export function BookingFormModal({ open, assets, departments, onClose, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      asset: '',
      startAt: '',
      endAt: '',
      department: '',
      purpose: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ asset: '', startAt: '', endAt: '', department: '', purpose: '', notes: '' });
    }
  }, [open, reset]);

  return (
    <Modal
      open={open}
      title="Create Resource Booking"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="booking-form" disabled={submitting}>
            Create booking
          </Button>
        </>
      }
    >
      <form id="booking-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
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
        <Input label="Start" type="datetime-local" error={errors.startAt?.message} {...register('startAt', { required: 'Start is required' })} />
        <Input label="End" type="datetime-local" error={errors.endAt?.message} {...register('endAt', { required: 'End is required' })} />
        <div className="md:col-span-2">
          <Textarea label="Purpose" error={errors.purpose?.message} {...register('purpose')} />
        </div>
        <div className="md:col-span-2">
          <Textarea label="Notes" error={errors.notes?.message} {...register('notes')} />
        </div>
      </form>
    </Modal>
  );
}
