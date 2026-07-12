import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

export function CategoryFormModal({ open, mode, initialValues, onClose, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      icon: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initialValues?.name || '',
        description: initialValues?.description || '',
        icon: initialValues?.icon || '',
        isActive: typeof initialValues?.isActive === 'boolean' ? initialValues.isActive : true,
      });
    }
  }, [open, initialValues, reset]);

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Edit Asset Category' : 'Create Asset Category'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="category-form" disabled={submitting}>
            {mode === 'edit' ? 'Save changes' : 'Create category'}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <Input
          label="Category name"
          placeholder="Laptops"
          error={errors.name?.message}
          {...register('name', {
            required: 'Category name is required',
            minLength: { value: 2, message: 'Use at least 2 characters' },
            maxLength: { value: 120, message: 'Use at most 120 characters' },
          })}
        />
        <Input
          label="Icon name"
          placeholder="ComputerDesktopIcon"
          error={errors.icon?.message}
          {...register('icon', {
            maxLength: { value: 120, message: 'Use at most 120 characters' },
          })}
        />
        <div className="md:col-span-2">
          <Textarea
            label="Description"
            placeholder="Corporate laptop and workstation inventory"
            error={errors.description?.message}
            {...register('description', {
              maxLength: { value: 500, message: 'Use at most 500 characters' },
            })}
          />
        </div>
        <Select label="Status" error={errors.isActive?.message} {...register('isActive')}>
          <option value={true}>Active</option>
          <option value={false}>Inactive</option>
        </Select>
      </form>
    </Modal>
  );
}
