import { z } from 'zod';

export const publisherSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập tên nhà xuất bản.')
    .max(120, 'Tên nhà xuất bản quá dài.'),
  address: z.string().trim().max(200, 'Địa chỉ quá dài.').optional().default(''),
  website: z.string().trim().max(160, 'Website quá dài.').optional().default(''),
});
