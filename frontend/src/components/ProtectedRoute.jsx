import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_REDIRECT = {
  warga: '/login-warga',
  rt: '/login-rtrw',
  rw: '/login-rtrw',
  superadmin: '/superadmin/login',
};

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Memuat...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    const firstRole = allowedRoles[0];
    return <Navigate to={ROLE_REDIRECT[firstRole] ?? '/login-warga'} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const redirect = ROLE_REDIRECT[user.role] ?? '/';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
