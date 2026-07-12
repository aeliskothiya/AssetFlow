import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('assetflow_token'));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.me();
        setUser(response.data);
      } catch (_error) {
        localStorage.removeItem('assetflow_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const signup = async (credentials) => {
    const response = await authService.signup(credentials);
    localStorage.setItem('assetflow_token', response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem('assetflow_token', response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem('assetflow_token');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, signup, logout, isAuthenticated: Boolean(token && user) }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
