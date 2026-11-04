import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên.').max(80, 'Họ tên quá dài.'),
    email: z.string().trim().email('Email không hợp lệ.'),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || /^(0|\+84)(\d{9,10})$/.test(value.replace(/\s|-/g, '')), {
        message: 'Số điện thoại không hợp lệ.',
      }),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp.',
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ.'),
});
