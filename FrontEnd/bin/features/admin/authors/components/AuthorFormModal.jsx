import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/components/common/Modal/Modal';
import Button from '@/components/common/Button/Button';
import { Input, Textarea } from '@/components/common/Input/Input';
import { authorSchema } from '@/features/authors/schemas/authorSchema';

export default function AuthorFormModal({ open, author, saving, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(authorSchema),
    defaultValues: { name: '', bio: '', avatar: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: author?.name || '',
        bio: author?.bio || '',
        avatar: author?.avatar || '',
      });
    }
  }, [open, author, reset]);

  const submit = handleSubmit(async (values) => {
    const ok = await onSubmit(values);
    if (ok) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={author ? 'Chỉnh sửa tác giả' : 'Thêm tác giả'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button type="submit" form="admin-author-form" loading={saving}>
            {author ? 'Lưu thay đổi' : 'Thêm tác giả'}
          </Button>
        </>
      }
    >
      <form id="admin-author-form" className="admin-form-grid" onSubmit={submit} noValidate>
        <Input
          label="Tên tác giả"
          placeholder="Ví dụ: Nguyễn Nhật Ánh"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Đường dẫn ảnh đại diện"
          placeholder="https://..."
          error={errors.avatar?.message}
          {...register('avatar')}
        />
        <Textarea
          label="Tiểu sử"
          rows={4}
          placeholder="Giới thiệu ngắn về tác giả..."
          error={errors.bio?.message}
          {...register('bio')}
        />
      </form>
    </Modal>
  );
}
