import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_HOME = { VOTER: '/voter/dashboard', OFFICER: '/officer/dashboard', ADMIN: '/admin/dashboard' };

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) {
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  }
  return children;
};

export default ProtectedRoute;
