import { createContext, useContext, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

/**
 * Decode payload JWT tanpa library (simple base64 decode)
 * Tidak memverifikasi signature — hanya untuk membaca data di client
 */
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const user = useMemo(() => {
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || decoded.exp * 1000 <= Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    return decoded;
  }, [token]);

  function login(newToken) {
    const decoded = decodeToken(newToken);
    if (decoded && decoded.exp * 1000 > Date.now()) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
      return;
    }
    localStorage.removeItem('token');
    setToken(null);
  }

  function logout() {
    // Kirim token ke backend untuk di-blacklist (fire-and-forget).
    // Hapus token di client tetap dilakukan meski request backend gagal.
    authService.logout().catch(() => { /* abaikan network error saat logout */ });
    setToken(null);
    localStorage.removeItem('token');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam <AuthProvider>');
  return ctx;
}
