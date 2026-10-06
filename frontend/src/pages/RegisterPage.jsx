import { Check, Circle } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, FormField, Input } from '../components/ui/index.js';
import useAuth from '../hooks/useAuth.js';
import { PASSWORD_RULES, registerSchema } from '../validation/schemas.js';

const REGISTER_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'password'];

/** Renders the validated account-creation form. */
export default function RegisterPage() {
  const { registerAccount } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    criteriaMode: 'all',
  });
  const password = watch('password', '');

  /** Creates an account and maps server validation errors to their fields. */
  async function onSubmit(values) {
    const { confirmPassword, ...details } = values;
    void confirmPassword;

    try {
      await registerAccount(details);
      navigate('/login?registered=1', { replace: true });
    } catch (error) {
      if (error?.status === 409) {
        setError('email', {
          type: 'server',
          message: error.message,
        });
        return;
      }

      const unhandledErrors = [];
      for (const [field, message] of Object.entries(error?.fieldErrors ?? {})) {
        if (REGISTER_FIELDS.includes(field)) {
          setError(field, { type: 'server', message });
        } else {
          unhandledErrors.push(message);
        }
      }

      if (
        unhandledErrors.length > 0 ||
        Object.keys(error?.fieldErrors ?? {}).length === 0
      ) {
        setError('root.serverError', {
          type: 'server',
          message: error?.isApiError
            ? error.message
            : 'Unable to create your account. Try again.',
        });
      }
    }
  }

  return (
    <section className="auth-page" aria-labelledby="register-heading">
      <div className="auth-panel auth-panel--wide">
        <h1 id="register-heading">Create your account</h1>
        {errors.root?.serverError?.message && (
          <Alert>{errors.root.serverError.message}</Alert>
        )}
        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="auth-form__name-fields">
            <FormField
              label="First name"
              htmlFor="register-first-name"
              error={errors.firstName}
            >
              <Input
                id="register-first-name"
                autoComplete="given-name"
                {...register('firstName')}
              />
            </FormField>
            <FormField
              label="Last name"
              htmlFor="register-last-name"
              error={errors.lastName}
            >
              <Input
                id="register-last-name"
                autoComplete="family-name"
                {...register('lastName')}
              />
            </FormField>
          </div>
          <FormField
            label="Email"
            htmlFor="register-email"
            error={errors.email}
          >
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              {...register('email')}
            />
          </FormField>
          <FormField
            label="Phone"
            htmlFor="register-phone"
            error={errors.phone}
          >
            <Input
              id="register-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              {...register('phone')}
            />
          </FormField>
          <FormField
            label="Password"
            htmlFor="register-password"
            error={errors.password}
          >
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
            />
          </FormField>
          <ul className="password-rules" aria-label="Password requirements">
            {PASSWORD_RULES.map((rule) => {
              const isValid = rule.test(password);
              const RuleIcon = isValid ? Check : Circle;
              return (
                <li
                  className="password-rules__item"
                  data-valid={isValid}
                  key={rule.id}
                >
                  <RuleIcon aria-hidden="true" size={16} />
                  <span>{rule.label}</span>
                </li>
              );
            })}
          </ul>
          <FormField
            label="Confirm password"
            htmlFor="register-confirm-password"
            error={errors.confirmPassword}
          >
            <Input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
          </FormField>
          <Button
            type="submit"
            loading={isSubmitting}
            loadingLabel="Creating account"
          >
            Create account
          </Button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
