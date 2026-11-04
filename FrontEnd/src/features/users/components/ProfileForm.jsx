import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Textarea } from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { profileSchema } from '../schemas/userSchema';

export default function ProfileForm({ profile, saving, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: profile?.fullName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    },
  });

  return (
    <form className="panel profile-panel" onSubmit={handleSubmit(onSubmit)}>
      <h3 className="panel-title">Thông tin cá nhân</h3>
      <div className="form-grid">
        <div className="form-row">
          <Input label="Họ và tên" error={errors.fullName?.message} {...register('fullName')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        </div>
        <div className="form-row">
          <Input label="Số điện thoại" error={errors.phone?.message} {...register('phone')} />
          <Input label="Tên đăng nhập" value={profile?.username || ''} disabled readOnly />
        </div>
        <Textarea
          label="Địa chỉ"
          rows={3}
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
          error={errors.address?.message}
          {...register('address')}
        />
      </div>
      <div className="form-actions">
        <Button type="submit" loading={saving}>
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
