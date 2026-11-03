import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/app/providers/ToastProvider';
import AuthLayout from '../components/AuthLayout';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      await forgotPassword(data.email);
      setSent(true);
      toast.success('Đã ghi nhận yêu cầu đặt lại mật khẩu.');
    } catch (error) {
      toast.error(error.message || 'Không thể gửi yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu."
      footer={
        <p>
          Nhớ ra mật khẩu rồi? <Link to="/login">Đăng nhập</Link>
        </p>
      }
    >
      {sent ? (
        <div className="auth-success">
          <CheckCircle2 size={40} />
          <h3>Kiểm tra hộp thư của bạn</h3>
          <p className="muted">
            Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu trong vài
            phút tới.
          </p>
          <Link to="/login" className="link-btn">
            Quay lại đăng nhập
          </Link>
        </div>
      ) : (
        <ForgotPasswordForm submitting={submitting} onSubmit={handleSubmit} />
      )}
    </AuthLayout>
  );
}
