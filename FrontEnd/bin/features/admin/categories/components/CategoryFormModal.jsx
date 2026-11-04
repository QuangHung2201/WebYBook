import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/components/common/Modal/Modal';
import Button from '@/components/common/Button/Button';
import { Input, Textarea } from '@/components/common/Input/Input';
import { categorySchema } from '@/features/categories/schemas/categorySchema';

export default function CategoryFormModal({ open, category, saving, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ name: category?.name || '', description: category?.description || '' });
    }
  }, [open, category, reset]);

  const submit = handleSubmit(async (values) => {
    const ok = await onSubmit(values);
    if (ok) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button type="submit" form="admin-category-form" loading={saving}>
            {category ? 'Lưu thay đổi' : 'Thêm danh mục'}
          </Button>
        </>
      }
    >
      <form id="admin-category-form" className="admin-form-grid" onSubmit={submit} noValidate>
        <Input
          label="Tên danh mục"
          placeholder="Ví dụ: Văn học"
          error={errors.name?.message}
          {...register('name')}
        />
        <Textarea
          label="Mô tả"
          rows={4}
          placeholder="Giới thiệu ngắn về nhóm sách này..."
          error={errors.description?.message}
          {...register('description')}
        />
        <p className="admin-form-note">Đường dẫn (slug) sẽ được tạo tự động từ tên danh mục.</p>
      </form>
    </Modal>
  );
}
