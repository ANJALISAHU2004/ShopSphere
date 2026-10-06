import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Button, FormField, Input } from '../ui/index.js';
import { changePasswordSchema } from '../../validation/schemas.js';

const PASSWORD_FIELDS = ['currentPassword', 'newPassword', 'confirmPassword'];

/** Changes the account password and maps an invalid current password to its field. */
export default function ChangePasswordForm({ onSave }) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
  });

  async function submit(values) {
    const { confirmPassword, ...passwords } = values;
    void confirmPassword;
    try {
      await onSave(passwords);
      reset();
    } catch (error) {
      const fieldErrors = error?.fieldErrors ?? {};
      const unhandledErrors = [];
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (PASSWORD_FIELDS.includes(field)) {
          setError(field, { type: 'server', message });
        } else {
          unhandledErrors.push(message);
        }
      }
      if (error?.status === 400 && Object.keys(fieldErrors).length === 0) {
        setError('currentPassword', {
          type: 'server',
          message: error.message,
        });
      } else if (
        unhandledErrors.length ||
        !Object.keys(fieldErrors).some((field) =>
          PASSWORD_FIELDS.includes(field),
        )
      ) {
        setError('root.serverError', {
          type: 'server',
          message:
            error?.message ?? 'Unable to change your password. Try again.',
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
        label="Current password"
        htmlFor="current-password"
        error={errors.currentPassword}
      >
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          {...register('currentPassword')}
        />
      </FormField>
      <FormField
        label="New password"
        htmlFor="new-password"
        error={errors.newPassword}
        hint="Use 8–64 characters with uppercase, lowercase, a number, and a special character."
      >
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          {...register('newPassword')}
        />
      </FormField>
      <FormField
        label="Confirm new password"
        htmlFor="confirm-new-password"
        error={errors.confirmPassword}
      >
        <Input
          id="confirm-new-password"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
      </FormField>
      <Button
        type="submit"
        loading={isSubmitting}
        loadingLabel="Updating password"
      >
        Change password
      </Button>
    </form>
  );
}
