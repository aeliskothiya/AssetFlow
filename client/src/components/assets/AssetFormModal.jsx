import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

const mediaToText = (items = []) =>
  items.map((item) => `${item.url}|${item.publicId}`).join('\n');

export function AssetFormModal({
  open,
  mode,
  initialValues,
  categories,
  departments,
  onClose,
  onSubmit,
  submitting,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      category: '',
      serialNumber: '',
      purchaseDate: '',
      purchaseCost: '',
      condition: 'Good',
      status: 'Available',
      location: '',
      sharedBookable: false,
      department: '',
      notes: '',
      imagesText: '',
      documentsText: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initialValues?.name || '',
        category: initialValues?.category?._id || initialValues?.category || '',
        serialNumber: initialValues?.serialNumber || '',
        purchaseDate: initialValues?.purchaseDate ? String(initialValues.purchaseDate).slice(0, 10) : '',
        purchaseCost: initialValues?.purchaseCost ?? '',
        condition: initialValues?.condition || 'Good',
        status: initialValues?.status || 'Available',
        location: initialValues?.location || '',
        sharedBookable: Boolean(initialValues?.sharedBookable),
        department: initialValues?.department?._id || initialValues?.department || '',
        notes: initialValues?.notes || '',
        imagesText: mediaToText(initialValues?.images),
        documentsText: mediaToText(initialValues?.documents),
      });
    }
  }, [open, initialValues, reset]);

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Edit Asset' : 'Register Asset'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="asset-form" disabled={submitting}>
            {mode === 'edit' ? 'Save changes' : 'Register asset'}
          </Button>
        </>
      }
    >
      <form id="asset-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <Input
          label="Asset name"
          error={errors.name?.message}
          {...register('name', { required: 'Asset name is required' })}
        />
        <Input
          label="Serial number"
          error={errors.serialNumber?.message}
          {...register('serialNumber', { required: 'Serial number is required' })}
        />
        <Select label="Category" error={errors.category?.message} {...register('category', { required: 'Category is required' })}>
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Input
          label="Purchase date"
          type="date"
          error={errors.purchaseDate?.message}
          {...register('purchaseDate', { required: 'Purchase date is required' })}
        />
        <Input
          label="Purchase cost"
          type="number"
          step="0.01"
          error={errors.purchaseCost?.message}
          {...register('purchaseCost', { required: 'Purchase cost is required' })}
        />
        <Select label="Condition" error={errors.condition?.message} {...register('condition')}>
          {['New', 'Good', 'Fair', 'Poor', 'Damaged'].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <Select label="Status" error={errors.status?.message} {...register('status')}>
          {['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <Input
          label="Location"
          error={errors.location?.message}
          {...register('location')}
        />
        <Select label="Department" error={errors.department?.message} {...register('department')}>
          <option value="">Unassigned</option>
          {departments.map((department) => (
            <option key={department._id} value={department._id}>
              {department.name}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <input type="checkbox" className="h-4 w-4" {...register('sharedBookable')} />
          Shared and bookable
        </label>
        <div className="md:col-span-2">
          <Textarea label="Notes" error={errors.notes?.message} {...register('notes')} />
        </div>
        <div className="md:col-span-2">
          <Textarea
            label="Images"
            placeholder="One per line in url|publicId format"
            error={errors.imagesText?.message}
            {...register('imagesText')}
          />
        </div>
        <div className="md:col-span-2">
          <Textarea
            label="Documents"
            placeholder="One per line in url|publicId format"
            error={errors.documentsText?.message}
            {...register('documentsText')}
          />
        </div>
      </form>
    </Modal>
  );
}
