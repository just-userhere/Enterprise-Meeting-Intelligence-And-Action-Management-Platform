import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mm_user') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!!localStorage.getItem('mm_token'));

  useEffect(() => {
    if (!localStorage.getItem('mm_token')) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((r) => {
        setUser(r.data);
        localStorage.setItem('mm_user', JSON.stringify(r.data));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('mm_token');
        localStorage.removeItem('mm_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    localStorage.setItem('mm_token', r.data.access_token);
    localStorage.setItem('mm_user', JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const r = await api.post('/auth/register', payload);
    localStorage.setItem('mm_token', r.data.access_token);
    localStorage.setItem('mm_user', JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
