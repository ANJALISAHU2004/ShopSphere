import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Button, FormField, Input } from '../ui/index.js';
import { adminCategorySchema } from '../../validation/schemas.js';

const CATEGORY_FIELDS = ['name', 'description'];

/** Adds or renames a category and maps server validation errors to fields. */
export default function CategoryForm({ category, onSave, onCancel }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminCategorySchema),
    mode: 'onBlur',
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
    },
  });

  async function submit(values) {
    try {
      await onSave(values);
    } catch (error) {
      const unhandledErrors = [];
      for (const [field, message] of Object.entries(error?.fieldErrors ?? {})) {
        if (CATEGORY_FIELDS.includes(field)) {
          setError(field, { type: 'server', message });
        } else {
          unhandledErrors.push(message);
        }
      }
      if (
        unhandledErrors.length ||
        !Object.keys(error?.fieldErrors ?? {}).length
      ) {
        setError('root.serverError', {
          type: 'server',
          message: error?.message ?? 'Unable to save this category. Try again.',
        });
      }
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit(submit)} noValidate>
      {errors.root?.serverError?.message && (
        <Alert>{errors.root.serverError.message}</Alert>
      )}
      <FormField
        label="Category name"
        htmlFor="admin-category-name"
        error={errors.name}
      >
        <Input id="admin-category-name" {...register('name')} />
      </FormField>
      <FormField
        label="Description (optional)"
        htmlFor="admin-category-description"
        error={errors.description}
      >
        <textarea
          className="ui-input admin-form__textarea"
          id="admin-category-description"
          rows={3}
          {...register('description')}
        />
      </FormField>
      <div className="admin-form__actions">
        <Button
          type="submit"
          loading={isSubmitting}
          loadingLabel="Saving category"
        >
          {category ? 'Save category' : 'Add category'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
