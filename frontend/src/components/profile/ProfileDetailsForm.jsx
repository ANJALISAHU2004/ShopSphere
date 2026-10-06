import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Button, FormField, Input } from '../ui/index.js';
import { profileSchema } from '../../validation/schemas.js';

const PROFILE_FIELDS = ['firstName', 'lastName', 'phone'];

/** Edits a user's name and phone while keeping the sign-in email read-only. */
export default function ProfileDetailsForm({ profile, onSave }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
    },
  });

  useEffect(() => {
    reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
    });
  }, [profile, reset]);

  async function submit(values) {
    try {
      await onSave(values);
    } catch (error) {
      const unhandledErrors = [];
      for (const [field, message] of Object.entries(error?.fieldErrors ?? {})) {
        if (PROFILE_FIELDS.includes(field)) {
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
          message:
            error?.message ?? 'Unable to update your profile. Try again.',
        });
      }
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit(submit)} noValidate>
      {errors.root?.serverError?.message && (
        <Alert>{errors.root.serverError.message}</Alert>
      )}
      <div className="auth-form__name-fields">
        <FormField
          label="First name"
          htmlFor="profile-first-name"
          error={errors.firstName}
        >
          <Input
            id="profile-first-name"
            autoComplete="given-name"
            {...register('firstName')}
          />
        </FormField>
        <FormField
          label="Last name"
          htmlFor="profile-last-name"
          error={errors.lastName}
        >
          <Input
            id="profile-last-name"
            autoComplete="family-name"
            {...register('lastName')}
          />
        </FormField>
      </div>
      <FormField
        label="Email"
        htmlFor="profile-email"
        hint="Your email is your sign-in and can't be changed."
      >
        <Input
          id="profile-email"
          type="email"
          autoComplete="email"
          value={profile.email}
          readOnly
        />
      </FormField>
      <FormField label="Phone" htmlFor="profile-phone" error={errors.phone}>
        <Input
          id="profile-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          {...register('phone')}
        />
      </FormField>
      <Button
        type="submit"
        loading={isSubmitting}
        loadingLabel="Saving changes"
      >
        Save details
      </Button>
    </form>
  );
}
