import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

const defaultValues = {
  name: '',
  code: '',
  description: '',
  isActive: true,
};

export function DepartmentFormModal({ open, mode, initialValues, onClose, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initialValues?.name || '',
        code: initialValues?.code || '',
        description: initialValues?.description || '',
        isActive: typeof initialValues?.isActive === 'boolean' ? initialValues.isActive : true,
      });
    }
  }, [open, initialValues, reset]);

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Edit Department' : 'Create Department'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="department-form" disabled={submitting}>
            {mode === 'edit' ? 'Save changes' : 'Create department'}
          </Button>
        </>
      }
    >
      <form id="department-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <Input
          label="Department name"
          placeholder="Human Resources"
          error={errors.name?.message}
          {...register('name', {
            required: 'Department name is required',
            minLength: { value: 2, message: 'Use at least 2 characters' },
            maxLength: { value: 120, message: 'Use at most 120 characters' },
          })}
        />
        <Input
          label="Department code"
          placeholder="HR"
          error={errors.code?.message}
          {...register('code', {
            required: 'Department code is required',
            minLength: { value: 2, message: 'Use at least 2 characters' },
            maxLength: { value: 20, message: 'Use at most 20 characters' },
          })}
        />
        <div className="md:col-span-2">
          <Input
            label="Description"
            placeholder="Primary department for people operations"
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
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400 md:col-span-1">
          Department managers can be assigned later from the user management module.
        </div>
      </form>
    </Modal>
  );
}
