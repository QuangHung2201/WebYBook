import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Vui lòng nhập email hoặc tên đăng nhập.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên.').max(80, 'Họ tên quá dài.'),
    username: z
      .string()
      .trim()
      .min(4, 'Tên đăng nhập phải có ít nhất 4 ký tự.')
      .max(30, 'Tên đăng nhập tối đa 30 ký tự.')
      .regex(/^[a-zA-Z0-9_.]+$/, 'Tên đăng nhập chỉ gồm chữ, số, dấu chấm hoặc gạch dưới.'),
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
    agree: z.literal(true, { errorMap: () => ({ message: 'Bạn cần đồng ý với điều khoản.' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp.',
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ.'),
});
