import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên.').max(80, 'Họ tên quá dài.'),
  email: z.string().trim().email('Email không hợp lệ.'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^(0|\+84)(\d{9,10})$/.test(value.replace(/\s|-/g, '')), {
      message: 'Số điện thoại không hợp lệ.',
    }),
  address: z.string().trim().max(200, 'Địa chỉ quá dài.').optional().default(''),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Mật khẩu hiện tại phải có ít nhất 6 ký tự.'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp.',
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ['newPassword'],
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại.',
  });
