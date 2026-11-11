import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Textarea } from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { contactSchema } from '../schemas/contactSchema';

export default function ContactForm({ submitting, onSubmit, user }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      subject: '',
      message: '',
    },
  });

  useEffect(() => {
    if (!isDirty) {
      reset({
        name: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        subject: '',
        message: '',
      });
    }
  }, [user?.id, user?.fullName, user?.email, user?.phone, isDirty, reset]);

  const submit = async (data) => {
    if (submitting) return;
    const success = await onSubmit(data);
    if (success) reset();
  };

  return (
    <form className="panel contact-form" onSubmit={handleSubmit(submit)}>
      <h3 className="panel-title">Gửi tin nhắn cho chúng tôi</h3>
      <div className="form-grid">
        <div className="form-row">
          <Input label="Họ và tên" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        </div>
        <div className="form-row">
          <Input label="Số điện thoại" error={errors.phone?.message} {...register('phone')} />
          <Input label="Tiêu đề" error={errors.subject?.message} {...register('subject')} />
        </div>
        <Textarea
          label="Nội dung"
          rows={5}
          placeholder="Bạn cần hỗ trợ điều gì?"
          error={errors.message?.message}
          {...register('message')}
        />
      </div>
      <div className="form-actions">
        <Button type="submit" loading={submitting}>
          Gửi liên hệ
        </Button>
      </div>
    </form>
  );
}
