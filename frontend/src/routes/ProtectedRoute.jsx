import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

/** Requires a customer session and preserves the requested path for login. */
export default function ProtectedRoute() {
  const { session, isAdmin } = useAuth();
  const location = useLocation();

  if (!session) {
    const redirect = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}`,
    );
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (isAdmin) return <Navigate to="/admin/orders" replace />;
  return <Outlet />;
}
