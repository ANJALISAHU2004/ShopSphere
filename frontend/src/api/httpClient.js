import axios from 'axios';
import { readSession, clearSession } from '../utils/session.js';
import { toApiError } from './apiError.js';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

let onUnauthorized = () => {};

/** Registers the application response to an unauthorized API response. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = typeof handler === 'function' ? handler : () => {};
}

httpClient.interceptors.request.use((config) => {
  const session = readSession();
  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    const isLoginCall = error.config?.url?.includes('/api/auth/login');

    if (apiError.status === 401 && !isLoginCall) {
      clearSession();
      onUnauthorized();
    }

    return Promise.reject(apiError);
  },
);

export default httpClient;
