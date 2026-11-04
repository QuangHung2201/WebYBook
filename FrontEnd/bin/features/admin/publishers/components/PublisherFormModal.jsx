import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/components/common/Modal/Modal';
import Button from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { publisherSchema } from '@/features/publishers/schemas/publisherSchema';

export default function PublisherFormModal({ open, publisher, saving, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(publisherSchema),
    defaultValues: { name: '', address: '', website: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: publisher?.name || '',
        address: publisher?.address || '',
        website: publisher?.website || '',
      });
    }
  }, [open, publisher, reset]);

  const submit = handleSubmit(async (values) => {
    const ok = await onSubmit(values);
    if (ok) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={publisher ? 'Chỉnh sửa nhà xuất bản' : 'Thêm nhà xuất bản'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button type="submit" form="admin-publisher-form" loading={saving}>
            {publisher ? 'Lưu thay đổi' : 'Thêm nhà xuất bản'}
          </Button>
        </>
      }
    >
      <form id="admin-publisher-form" className="admin-form-grid" onSubmit={submit} noValidate>
        <Input
          label="Tên nhà xuất bản"
          placeholder="Ví dụ: NXB Trẻ"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Địa chỉ"
          placeholder="Tỉnh/Thành phố hoặc địa chỉ đầy đủ"
          error={errors.address?.message}
          {...register('address')}
        />
        <Input
          label="Website"
          placeholder="nxbtre.com.vn"
          error={errors.website?.message}
          {...register('website')}
        />
      </form>
    </Modal>
  );
}
