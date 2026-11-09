import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/app/providers/ToastProvider';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/';

  if (user) return <Navigate to={redirectTo} replace />;

  // xử lý submit 
  const handleLogin = async (data) => {
    setSubmitting(true);
    try {
      await login(data);  // được gọi từ AuthProvider để submit
      toast.success('Đăng nhập thành công. Chào mừng bạn trở lại!');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Đăng nhập thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục mua sắm và theo dõi đơn hàng."
      footer={
        <p>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      }
    >
      <LoginForm submitting={submitting} onSubmit={handleLogin} />
    </AuthLayout>
  );
}
