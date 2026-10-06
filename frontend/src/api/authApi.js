import httpClient from './httpClient.js';

/** Authenticates a customer or administrator. */
export async function login(credentials) {
  const response = await httpClient.post('/api/auth/login', credentials);
  return response.data;
}

/** Discards the server-side authentication token. */
export async function logout() {
  return httpClient.post('/api/auth/logout');
}

/** Changes the authenticated user's password. */
export async function changePassword(passwords) {
  const response = await httpClient.post(
    '/api/auth/change-password',
    passwords,
  );
  return response.data;
}
