import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem('accessToken') || null
  );

  /**
   * Called after successful login.
   * Stores tokens + user info in localStorage and context.
   */
  const login = useCallback(async (credentials) => {
    const response = await apiLogin(credentials);
    const { data } = response;

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify({
      email: data.email,
      name: data.name,
      role: data.role,
    }));

    setAccessToken(data.accessToken);
    setUser({ email: data.email, name: data.name, role: data.role });

    return response;
  }, []);

  /**
   * Clears all auth state and tokens, then calls logout endpoint.
   */
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore errors — still clear local state
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  /**
   * Clears auth state without calling the logout endpoint.
   * Used after account deactivation where the account no longer exists.
   */
  const clearAuth = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    setAccessToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!accessToken && !!user;

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthenticated, login, logout, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
