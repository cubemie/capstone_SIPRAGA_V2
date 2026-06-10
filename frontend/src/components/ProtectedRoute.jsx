import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_REDIRECT = {
  warga: '/login-warga',
  rt: '/login-rtrw',
  rw: '/login-rtrw',
  superadmin: '/superadmin/login',
};

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    const firstRole = allowedRoles?.[0]; 
    return <Navigate to={ROLE_REDIRECT[firstRole] ?? '/login-warga'} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
