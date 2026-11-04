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
      .min(1, 'Vui lòng nhập số điện thoại.')
      .refine(
        (value) =>
          /^(?:\+84|0)(?:2[0-9]|3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])\d{7}$/.test(
            value.replace(/\s|-/g, ''),
          ),
        { message: 'Số điện thoại không hợp lệ.' },
      ),
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
