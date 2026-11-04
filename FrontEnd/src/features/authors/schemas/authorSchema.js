import { z } from 'zod';

export const authorSchema = z.object({
  name: z.string().trim().min(2, 'Vui lòng nhập tên tác giả.').max(100, 'Tên tác giả quá dài.'),
  bio: z.string().trim().max(1000, 'Tiểu sử quá dài.').optional().default(''),
  avatar: z.string().trim().optional().default(''),
});
