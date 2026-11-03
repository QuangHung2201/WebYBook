import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/components/common/Modal/Modal';
import Button from '@/components/common/Button/Button';
import { Input, Select, Textarea } from '@/components/common/Input/Input';
import { toInputDate } from '@/shared/utils/formatDate';
import {
  VOUCHER_STATUS,
  VOUCHER_STATUS_OPTIONS,
  VOUCHER_TYPE,
  VOUCHER_TYPE_OPTIONS,
} from '@/data/constants/voucherStatus';
import { voucherSchema } from '@/features/vouchers/schemas/voucherSchema';

function defaultValues() {
  return {
    code: '',
    name: '',
    description: '',
    type: VOUCHER_TYPE.PERCENT,
    value: 10,
    minOrder: 0,
    maxDiscount: 50000,
    quantity: 100,
    startDate: toInputDate(new Date()),
    endDate: toInputDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    status: VOUCHER_STATUS.ACTIVE,
  };
}

function toFormValues(voucher) {
  if (!voucher) return defaultValues();
  return {
    code: voucher.code || '',
    name: voucher.name || '',
    description: voucher.description || '',
    type: voucher.type || VOUCHER_TYPE.PERCENT,
    value: Number(voucher.value) || 0,
    minOrder: Number(voucher.minOrder) || 0,
    maxDiscount: Number(voucher.maxDiscount) || 0,
    quantity: Number(voucher.quantity) || 1,
    startDate: toInputDate(voucher.startDate),
    endDate: toInputDate(voucher.endDate),
    status: voucher.status || VOUCHER_STATUS.ACTIVE,
  };
}

export default function VoucherFormModal({ open, voucher, saving, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(voucherSchema),
    defaultValues: defaultValues(),
  });

  useEffect(() => {
    if (open) reset(toFormValues(voucher));
  }, [open, voucher, reset]);

  const type = watch('type');

  const submit = handleSubmit(async (values) => {
    const ok = await onSubmit({ ...values, code: values.code.toUpperCase() });
    if (ok) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={voucher ? 'Chỉnh sửa voucher' : 'Thêm voucher'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button type="submit" form="admin-voucher-form" loading={saving}>
            {voucher ? 'Lưu thay đổi' : 'Thêm voucher'}
          </Button>
        </>
      }
    >
      <form id="admin-voucher-form" className="admin-form-grid" onSubmit={submit} noValidate>
        <div className="admin-form-section">
          <span className="admin-form-section__title">Thông tin chương trình</span>
          <div className="admin-form-row">
            <Input
              label="Mã giảm giá"
              placeholder="Ví dụ: SACH50K"
              hint="Mã sẽ được chuyển thành chữ in hoa."
              error={errors.code?.message}
              {...register('code')}
            />
            <Input
              label="Tên chương trình"
              placeholder="Ví dụ: Giảm 50.000₫"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <Textarea
            label="Mô tả"
            rows={3}
            placeholder="Mô tả ngắn hiển thị cho khách hàng..."
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className="admin-form-section">
          <span className="admin-form-section__title">Mức giảm và điều kiện</span>
          <div className="admin-form-row">
            <Select
              label="Loại giảm giá"
              options={VOUCHER_TYPE_OPTIONS}
              error={errors.type?.message}
              {...register('type')}
            />
            <Input
              label={type === VOUCHER_TYPE.PERCENT ? 'Giá trị giảm (%)' : 'Số tiền giảm (₫)'}
              type="number"
              min="1"
              step={type === VOUCHER_TYPE.PERCENT ? '1' : '1000'}
              error={errors.value?.message}
              {...register('value')}
            />
          </div>
          <div className="admin-form-row">
            <Input
              label="Đơn hàng tối thiểu (₫)"
              type="number"
              min="0"
              step="1000"
              error={errors.minOrder?.message}
              {...register('minOrder')}
            />
            <Input
              label="Giảm tối đa (₫)"
              type="number"
              min="0"
              step="1000"
              hint="Để 0 nếu không giới hạn."
              error={errors.maxDiscount?.message}
              {...register('maxDiscount')}
            />
          </div>
          <div className="admin-form-row">
            <Input
              label="Số lượng phát hành"
              type="number"
              min="1"
              step="1"
              error={errors.quantity?.message}
              {...register('quantity')}
            />
            <Select
              label="Trạng thái"
              options={VOUCHER_STATUS_OPTIONS}
              error={errors.status?.message}
              {...register('status')}
            />
          </div>
        </div>

        <div className="admin-form-section">
          <span className="admin-form-section__title">Thời gian áp dụng</span>
          <div className="admin-form-row">
            <Input
              label="Ngày bắt đầu"
              type="date"
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              error={errors.endDate?.message}
              {...register('endDate')}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
