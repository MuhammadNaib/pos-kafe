import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    api('/auth/me')
      .then((data) => {
        setUser(data);
        setStatus('authenticated');
      })
      .catch(() => setStatus('guest'));
  }, []);

  useEffect(() => {
    function keluarkan() {
      setUser(null);
      setStatus('guest');
    }

    window.addEventListener('sesi-berakhir', keluarkan);
    return () => window.removeEventListener('sesi-berakhir', keluarkan);
  }, []);

  async function login(email, password) {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    setUser(data);
    setStatus('authenticated');
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
    setStatus('guest');
  }

    async function muatUlangSaya() {
    setUser(await api('/auth/me'));
  }

    return (
    <AuthContext value={{ user, status, login, logout, muatUlangSaya }}>{children}</AuthContext>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}