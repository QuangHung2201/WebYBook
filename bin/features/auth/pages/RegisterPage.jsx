import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useToast } from '@/app/providers/ToastProvider';
import AuthLayout from '../components/AuthLayout';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleRegister = async (data) => {
    setSubmitting(true);
    try {
      await register(data);
      toast.success('Tạo tài khoản thành công. Chào mừng bạn đến với WebYBook!');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Đăng ký thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Tạo tài khoản mới"
      subtitle="Đăng ký để nhận nhiều ưu đãi và quản lý đơn hàng dễ dàng."
      footer={
        <p>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      }
    >
      <RegisterForm submitting={submitting} onSubmit={handleRegister} />
    </AuthLayout>
  );
}
