import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import useAuth from '../hooks/useAuth.js';

/** Requires an administrator session and reports denied access. */
export default function AdminRoute() {
  const { session, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (session && !isAdmin) toast.error("You don't have access to that page.");
  }, [isAdmin, session]);

  if (!session) {
    const redirect = encodeURIComponent(
      `${location.pathname}${location.search}`,
    );
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
