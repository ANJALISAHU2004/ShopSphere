import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { registerUser } from '../api/userApi.js';

/** Reads the current authentication state and actions. */
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return { ...context, registerAccount: registerUser };
}
