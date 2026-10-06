import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Button, FormField, Input } from '../ui/index.js';
import { addressSchema } from '../../validation/schemas.js';

const ADDRESS_FIELDS = ['line1', 'line2', 'city', 'state', 'pincode'];

/** Adds or edits a saved address using the shared address validation rules. */
export default function AddressForm({
  address,
  onSave,
  onCancel,
  saveLabel = 'Save address',
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
    defaultValues: {
      line1: address?.line1 ?? '',
      line2: address?.line2 ?? '',
      city: address?.city ?? '',
      state: address?.state ?? '',
      pincode: address?.pincode ?? '',
    },
  });

  async function submit(values) {
    try {
      await onSave(values);
    } catch (error) {
      const unhandledErrors = [];
      for (const [field, message] of Object.entries(error?.fieldErrors ?? {})) {
        if (ADDRESS_FIELDS.includes(field)) {
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
          message: error?.message ?? 'Unable to save this address. Try again.',
        });
      }
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit(submit)} noValidate>
      {errors.root?.serverError?.message && (
        <Alert>{errors.root.serverError.message}</Alert>
      )}
      <FormField
        label="Address line 1"
        htmlFor="profile-address-line1"
        error={errors.line1}
      >
        <Input
          id="profile-address-line1"
          autoComplete="address-line1"
          {...register('line1')}
        />
      </FormField>
      <FormField
        label="Address line 2 (optional)"
        htmlFor="profile-address-line2"
        error={errors.line2}
      >
        <Input
          id="profile-address-line2"
          autoComplete="address-line2"
          {...register('line2')}
        />
      </FormField>
      <div className="auth-form__name-fields">
        <FormField label="City" htmlFor="profile-city" error={errors.city}>
          <Input
            id="profile-city"
            autoComplete="address-level2"
            {...register('city')}
          />
        </FormField>
        <FormField label="State" htmlFor="profile-state" error={errors.state}>
          <Input
            id="profile-state"
            autoComplete="address-level1"
            {...register('state')}
          />
        </FormField>
      </div>
      <FormField
        label="PIN code"
        htmlFor="profile-pincode"
        error={errors.pincode}
      >
        <Input
          id="profile-pincode"
          inputMode="numeric"
          autoComplete="postal-code"
          {...register('pincode')}
        />
      </FormField>
      <div className="profile-form__actions">
        <Button
          type="submit"
          loading={isSubmitting}
          loadingLabel="Saving address"
        >
          {saveLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
