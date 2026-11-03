import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Vui lòng nhập họ tên.'),
  email: z.string().trim().email('Email không hợp lệ.'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^(0|\+84)(\d{9,10})$/.test(value.replace(/\s|-/g, '')), {
      message: 'Số điện thoại không hợp lệ.',
    }),
  subject: z.string().trim().min(3, 'Vui lòng nhập tiêu đề.'),
  message: z.string().trim().min(10, 'Nội dung cần ít nhất 10 ký tự.').max(1000, 'Nội dung quá dài.'),
});
