import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * Decode payload JWT tanpa library (simple base64 decode)
 * Tidak memverifikasi signature — hanya untuk membaca data di client
 */
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token');
    return t ? decodeToken(t) : null;
  });

  // Sinkronisasi state jika token berubah
  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      // Cek apakah token sudah expire
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser(decoded);
        localStorage.setItem('token', token);
      } else {
        logout();
      }
    } else {
      setUser(null);
      localStorage.removeItem('token');
    }
  }, [token]);

  function login(newToken) {
    setToken(newToken);
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam <AuthProvider>');
  return ctx;
}
