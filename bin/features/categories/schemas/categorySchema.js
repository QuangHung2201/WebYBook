import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập tên danh mục.')
    .max(80, 'Tên danh mục quá dài.'),
  description: z.string().trim().max(500, 'Mô tả quá dài.').optional().default(''),
});
