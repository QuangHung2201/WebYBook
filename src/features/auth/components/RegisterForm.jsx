import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, Phone, User } from 'lucide-react';
import { Input } from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { registerSchema } from '../schemas/authSchema';

export default function RegisterForm({ submitting, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agree: false,
    },
  });

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Họ và tên"
        placeholder="Nguyễn Văn An"
        icon={User}
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Input
        label="Tên đăng nhập"
        placeholder="nguyenvanan"
        icon={User}
        autoComplete="username"
        error={errors.username?.message}
        {...register('username')}
      />
      <div className="form-row">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Số điện thoại"
          placeholder="0912345678"
          icon={Phone}
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>
      <div className="form-row">
        <Input
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      <div>
        <label className="checkbox-row">
          <input type="checkbox" {...register('agree')} />
          <span>
            Tôi đồng ý với <a href="#terms">điều khoản sử dụng</a> và{' '}
            <a href="#privacy">chính sách bảo mật</a>.
          </span>
        </label>
        {errors.agree ? <span className="error">{errors.agree.message}</span> : null}
      </div>

      <Button type="submit" size="lg" fullWidth loading={submitting}>
        Tạo tài khoản
      </Button>
    </form>
  );
}
