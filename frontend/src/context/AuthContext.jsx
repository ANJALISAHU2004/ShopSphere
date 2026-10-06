import { createContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  login as loginRequest,
  logout as logoutRequest,
} from '../api/authApi.js';
import { setUnauthorizedHandler } from '../api/httpClient.js';
import { clearSession, readSession, writeSession } from '../utils/session.js';

export const AuthContext = createContext(null);

/** Provides session state, authentication actions, and expiry handling. */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const handlingUnauthorized = useRef(false);

  useEffect(() => {
    if (!session) return undefined;

    const expireSession = () => {
      clearSession();
      setSession(null);
      queryClient.clear();
      toast.info('Your session has expired. Sign in again.');
      navigate('/login', { replace: true });
    };
    const remaining = session.expiresAt - Date.now();

    if (remaining <= 0) {
      expireSession();
      return undefined;
    }

    const timer = window.setTimeout(expireSession, remaining);
    return () => window.clearTimeout(timer);
  }, [navigate, queryClient, session]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (handlingUnauthorized.current) return;
      handlingUnauthorized.current = true;
      clearSession();
      setSession(null);
      queryClient.clear();
      toast.error('Your session has expired. Sign in again.');
      navigate('/login', { replace: true });
    });

    return () => setUnauthorizedHandler(null);
  }, [navigate, queryClient]);

  /** Signs in and stores the server-issued session with its expiry time. */
  async function login(credentials) {
    const result = await loginRequest(credentials);
    const nextSession = {
      token: result.token,
      userId: result.userId,
      email: result.email,
      firstName: result.firstName,
      role: result.role,
      expiresAt: Date.now() + result.expiresIn * 1000,
    };

    writeSession(nextSession);
    handlingUnauthorized.current = false;
    setSession(nextSession);
    return nextSession;
  }

  /** Logs out on the server when possible, then always clears local state. */
  async function logout() {
    try {
      await logoutRequest();
    } catch {
      // Local session cleanup must still happen when the gateway is unavailable.
    } finally {
      clearSession();
      setSession(null);
      queryClient.clear();
      handlingUnauthorized.current = false;
    }
  }

  return (
    <AuthContext.Provider
      value={{ session, isAdmin: session?.role === 'ADMIN', login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
