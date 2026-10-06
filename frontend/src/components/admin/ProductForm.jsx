import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Button, FormField, Input } from '../ui/index.js';
import { adminProductSchema } from '../../validation/schemas.js';

const PRODUCT_FIELDS = [
  'name',
  'description',
  'price',
  'stockQuantity',
  'categoryId',
  'imageUrl',
];

/** Validates and submits product details with category and URL fields. */
export default function ProductForm({ product, categories, onSave, onCancel }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminProductSchema),
    mode: 'onBlur',
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? '',
      stockQuantity: product?.stockQuantity ?? 0,
      categoryId: product?.categoryId ?? '',
      imageUrl: product?.imageUrl ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? '',
      stockQuantity: product?.stockQuantity ?? 0,
      categoryId: product?.categoryId ?? '',
      imageUrl: product?.imageUrl ?? '',
    });
  }, [product, reset]);

  async function submit(values) {
    try {
      await onSave({
        ...values,
        imageUrl: values.imageUrl || '',
      });
    } catch (error) {
      const unhandledErrors = [];
      for (const [field, message] of Object.entries(error?.fieldErrors ?? {})) {
        if (PRODUCT_FIELDS.includes(field)) {
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
          message: error?.message ?? 'Unable to save this product. Try again.',
        });
      }
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit(submit)} noValidate>
      {errors.root?.serverError?.message && (
        <Alert>{errors.root.serverError.message}</Alert>
      )}
      <FormField label="Name" htmlFor="admin-product-name" error={errors.name}>
        <Input id="admin-product-name" {...register('name')} />
      </FormField>
      <FormField
        label="Description"
        htmlFor="admin-product-description"
        error={errors.description}
      >
        <textarea
          className="ui-input admin-form__textarea"
          id="admin-product-description"
          rows={4}
          {...register('description')}
        />
      </FormField>
      <div className="admin-form__row">
        <FormField
          label="Price"
          htmlFor="admin-product-price"
          error={errors.price}
        >
          <Input
            id="admin-product-price"
            type="number"
            min="0.01"
            step="0.01"
            {...register('price')}
          />
        </FormField>
        <FormField
          label="Stock quantity"
          htmlFor="admin-product-stock"
          error={errors.stockQuantity}
        >
          <Input
            id="admin-product-stock"
            type="number"
            min="0"
            step="1"
            {...register('stockQuantity')}
          />
        </FormField>
      </div>
      <FormField
        label="Category"
        htmlFor="admin-product-category"
        error={errors.categoryId}
      >
        <select
          className="ui-input"
          id="admin-product-category"
          {...register('categoryId')}
        >
          <option value="">Choose a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </FormField>
      <FormField
        label="Image URL (optional)"
        htmlFor="admin-product-image-url"
        error={errors.imageUrl}
        hint="Enter an image URL; uploads are not supported."
      >
        <Input
          id="admin-product-image-url"
          type="url"
          maxLength={255}
          {...register('imageUrl')}
        />
      </FormField>
      <div className="admin-form__actions">
        <Button
          type="submit"
          loading={isSubmitting}
          loadingLabel="Saving product"
        >
          {product ? 'Save product' : 'Add product'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
