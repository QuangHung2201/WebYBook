import { z } from 'zod';

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên người nhận.'),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)(\d{9,10})$/, 'Số điện thoại không hợp lệ.'),
  address: z.string().trim().min(8, 'Vui lòng nhập địa chỉ nhận hàng chi tiết.'),
  note: z.string().trim().max(500, 'Ghi chú quá dài.').optional().default(''),
});
