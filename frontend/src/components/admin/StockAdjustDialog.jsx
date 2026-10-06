import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Button, FormField, Input } from '../ui/index.js';
import { adminStockSchema } from '../../validation/schemas.js';

/** Provides a compact, validated stock-only update dialog. */
export default function StockAdjustDialog({ product, onSave, onCancel }) {
  const dialogRef = useRef(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminStockSchema),
    mode: 'onBlur',
    defaultValues: { stockQuantity: product.stockQuantity },
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    reset({ stockQuantity: product.stockQuantity });
  }, [product, reset]);

  async function submit(values) {
    try {
      await onSave(values.stockQuantity);
      dialogRef.current?.close();
    } catch (error) {
      const message =
        error?.fieldErrors?.stockQuantity ??
        error?.message ??
        'Unable to update stock. Try again.';
      setError(
        error?.fieldErrors?.stockQuantity
          ? 'stockQuantity'
          : 'root.serverError',
        { type: 'server', message },
      );
    }
  }

  return (
    <dialog
      className="confirm-dialog admin-stock-dialog"
      ref={dialogRef}
      aria-labelledby="admin-stock-heading"
      onCancel={(event) => {
        if (isSubmitting) event.preventDefault();
      }}
      onClose={onCancel}
    >
      <h2 id="admin-stock-heading">Adjust stock</h2>
      <p>{product.name}</p>
      <form className="admin-form" onSubmit={handleSubmit(submit)} noValidate>
        {errors.root?.serverError?.message && (
          <Alert>{errors.root.serverError.message}</Alert>
        )}
        <FormField
          label="Stock quantity"
          htmlFor="admin-stock-quantity"
          error={errors.stockQuantity}
        >
          <Input
            id="admin-stock-quantity"
            type="number"
            min="0"
            step="1"
            {...register('stockQuantity')}
          />
        </FormField>
        <div className="admin-form__actions">
          <Button
            type="submit"
            loading={isSubmitting}
            loadingLabel="Saving stock"
          >
            Save stock
          </Button>
          <Button
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => dialogRef.current?.close()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </dialog>
  );
}
