import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loading from '@/components/common/Loading/Loading';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function ProtectedRoute({ requireAdmin = false }) {
  const { user, isAdmin, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <Loading fullScreen label="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
