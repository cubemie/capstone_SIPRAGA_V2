import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Komponen pelindung route berdasarkan role.
 * 
 * @param {string|string[]} allowedRoles - Role yang diizinkan mengakses route ini
 * @param {string} redirectTo - Halaman tujuan jika tidak punya akses (default: /login-warga)
 */
export default function ProtectedRoute({ children, allowedRoles, redirectTo }) {
  const { user, token } = useAuth();

  // Belum login sama sekali
  if (!token || !user) {
    const loginPage = redirectTo || (
      allowedRoles?.includes('warga') ? '/login-warga' : '/login-rtrw'
    );
    return <Navigate to={loginPage} replace />;
  }

  // Cek role jika allowedRoles diberikan
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Arahkan ke dashboard yang sesuai dengan role yang dimiliki
    if (user.role === 'warga') return <Navigate to="/warga/dashboard" replace />;
    if (user.role === 'rt' || user.role === 'rw') return <Navigate to="/rtrw/dashboard" replace />;
    if (user.role === 'superadmin') return <Navigate to="/superadmin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
