import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { changePasswordSchema } from '../schemas/userSchema';

export default function ChangePasswordForm({ saving, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const submit = async (data) => {
    const success = await onSubmit(data);
    if (success) reset();
  };

  return (
    <form className="panel profile-panel" onSubmit={handleSubmit(submit)}>
      <h3 className="panel-title">Đổi mật khẩu</h3>
      <div className="form-grid">
        <Input
          label="Mật khẩu hiện tại"
          type="password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <div className="form-row">
          <Input
            label="Mật khẩu mới"
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
      </div>
      <div className="form-actions">
        <Button type="submit" variant="secondary" loading={saving}>
          Cập nhật mật khẩu
        </Button>
      </div>
    </form>
  );
}
