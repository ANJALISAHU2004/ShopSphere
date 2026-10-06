const SESSION_KEY = 'shopsphere.session';

/** Reads a valid, unexpired session from local storage. */
export function readSession() {
  try {
    const value = window.localStorage.getItem(SESSION_KEY);
    if (!value) return null;

    const session = JSON.parse(value);
    if (!session?.token || !Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now()) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    clearSession();
    return null;
  }
}

/** Stores the authenticated session in local storage. */
export function writeSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Removes the authenticated session from local storage. */
export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    return;
  }
}