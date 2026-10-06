import { useMutation } from '@tanstack/react-query';
import { changePassword } from '../api/authApi.js';

/** Changes the authenticated user's password. */
export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}
