import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { Input } from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { forgotPasswordSchema } from '../schemas/authSchema';

export default function ForgotPasswordForm({ submitting, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Email đăng ký"
        type="email"
        placeholder="you@example.com"
        icon={Mail}
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Button type="submit" size="lg" fullWidth loading={submitting}>
        Gửi yêu cầu
      </Button>
    </form>
  );
}
