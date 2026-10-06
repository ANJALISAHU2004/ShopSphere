import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, FormField, Input } from '../components/ui/index.js';
import useAuth from '../hooks/useAuth.js';
import { loginSchema } from '../validation/schemas.js';

/** Renders the validated sign-in form and handles the login response. */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  /** Submits credentials and returns the user to the requested route. */
  async function onSubmit(values) {
    try {
      const session = await login(values);
      const requestedPath = searchParams.get('redirect');
      const safePath =
        requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
          ? requestedPath
          : null;
      navigate(safePath || (session.role === 'ADMIN' ? '/admin/orders' : '/'), {
        replace: true,
      });
    } catch (error) {
      setError('root.serverError', {
        type: 'server',
        message: error?.isApiError
          ? error.message
          : 'Unable to sign in. Try again.',
      });
    }
  }

  return (
    <section className="auth-page" aria-labelledby="login-heading">
      <div className="auth-panel">
        <h1 id="login-heading">Sign in</h1>
        {searchParams.get('registered') === '1' && (
          <Alert variant="success">Account created. Sign in to continue.</Alert>
        )}
        {errors.root?.serverError?.message && (
          <Alert>{errors.root.serverError.message}</Alert>
        )}
        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <FormField label="Email" htmlFor="login-email" error={errors.email}>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              {...register('email')}
            />
          </FormField>
          <FormField
            label="Password"
            htmlFor="login-password"
            error={errors.password}
          >
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
          </FormField>
          <Button
            type="submit"
            loading={isSubmitting}
            loadingLabel="Signing in"
          >
            Sign in
          </Button>
        </form>
        <p className="auth-switch">
          New to ShopSphere? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
