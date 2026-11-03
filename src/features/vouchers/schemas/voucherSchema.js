import { z } from 'zod';
import { VOUCHER_STATUS, VOUCHER_TYPE } from '@/data/constants/voucherStatus';

export const voucherSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, 'Mã giảm giá phải có ít nhất 3 ký tự.')
      .max(30, 'Mã giảm giá quá dài.')
      .regex(/^[A-Za-z0-9_-]+$/, 'Mã chỉ gồm chữ, số, gạch ngang hoặc gạch dưới.'),
    name: z.string().trim().min(2, 'Vui lòng nhập tên chương trình.').max(120, 'Tên quá dài.'),
    description: z.string().trim().max(500, 'Mô tả quá dài.').optional().default(''),
    type: z.enum([VOUCHER_TYPE.PERCENT, VOUCHER_TYPE.FIXED]),
    value: z.coerce.number().min(1, 'Giá trị giảm phải lớn hơn 0.'),
    minOrder: z.coerce.number().min(0, 'Đơn hàng tối thiểu không hợp lệ.'),
    maxDiscount: z.coerce.number().min(0, 'Mức giảm tối đa không hợp lệ.'),
    quantity: z.coerce.number().int('Số lượng phải là số nguyên.').min(1, 'Số lượng phải lớn hơn 0.'),
    startDate: z.string().min(1, 'Chọn ngày bắt đầu.'),
    endDate: z.string().min(1, 'Chọn ngày kết thúc.'),
    status: z.enum([VOUCHER_STATUS.ACTIVE, VOUCHER_STATUS.INACTIVE]),
  })
  .refine((data) => data.type !== VOUCHER_TYPE.PERCENT || data.value <= 100, {
    path: ['value'],
    message: 'Phần trăm giảm không được vượt quá 100%.',
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    path: ['endDate'],
    message: 'Ngày kết thúc phải sau ngày bắt đầu.',
  });
