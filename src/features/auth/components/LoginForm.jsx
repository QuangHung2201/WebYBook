import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { Input } from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { loginSchema } from '../schemas/authSchema';

export default function LoginForm({ submitting, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  });

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Email"
        placeholder="you@example.com"
        icon={Mail}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Mật khẩu"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="auth-form__row">
        <label className="checkbox-row">
          <input type="checkbox" {...register('remember')} /> Ghi nhớ đăng nhập
        </label>
        <Link to="/forgot-password" className="link-btn">
          Quên mật khẩu?
        </Link>
      </div>

      <Button type="submit" size="lg" fullWidth loading={submitting}>
        Đăng nhập
      </Button>

      <div className="auth-demo">
        <strong>Tài khoản demo</strong>
        <span>Khách hàng: user@webybook.vn / User@123</span>
        <span>Quản trị: admin@webybook.vn / Admin@123</span>
      </div>
    </form>
  );
}
