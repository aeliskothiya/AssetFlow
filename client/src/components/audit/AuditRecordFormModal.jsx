import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

export function AuditRecordFormModal({ open, assets, onClose, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      asset: '',
      status: 'Verified',
      conditionObserved: 'Good',
      locationObserved: '',
      notes: '',
      discrepancyNotes: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        asset: '',
        status: 'Verified',
        conditionObserved: 'Good',
        locationObserved: '',
        notes: '',
        discrepancyNotes: '',
      });
    }
  }, [open, reset]);

  return (
    <Modal
      open={open}
      title="Add Audit Record"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" form="audit-record-form" disabled={submitting}>Save record</Button>
        </>
      }
    >
      <form id="audit-record-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <Select label="Asset" error={errors.asset?.message} {...register('asset', { required: 'Asset is required' })}>
          <option value="">Select asset</option>
          {assets.map((asset) => <option key={asset._id} value={asset._id}>{asset.assetTag} - {asset.name}</option>)}
        </Select>
        <Select label="Status" error={errors.status?.message} {...register('status')}>
          {['Verified', 'Missing', 'Damaged', 'Mismatch'].map((value) => <option key={value} value={value}>{value}</option>)}
        </Select>
        <Select label="Condition observed" error={errors.conditionObserved?.message} {...register('conditionObserved')}>
          {['New', 'Good', 'Fair', 'Poor', 'Damaged'].map((value) => <option key={value} value={value}>{value}</option>)}
        </Select>
        <Input label="Location observed" error={errors.locationObserved?.message} {...register('locationObserved')} />
        <div className="md:col-span-2">
          <Textarea label="Notes" error={errors.notes?.message} {...register('notes')} />
        </div>
        <div className="md:col-span-2">
          <Textarea label="Discrepancy notes" error={errors.discrepancyNotes?.message} {...register('discrepancyNotes')} />
        </div>
      </form>
    </Modal>
  );
}
