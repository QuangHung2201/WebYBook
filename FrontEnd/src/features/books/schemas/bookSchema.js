import { z } from 'zod';
import { BOOK_STATUS } from '@/data/constants/bookStatus';

export const bookSchema = z.object({
  isbn: z.string().trim().min(1, 'Vui lòng nhập ISBN.').max(20, 'ISBN quá dài.'),
  title: z.string().trim().min(2, 'Vui lòng nhập tên sách.').max(160, 'Tên sách quá dài.'),
  authorId: z.coerce.number({ invalid_type_error: 'Chọn tác giả.' }).int().positive('Chọn tác giả.'),
  categoryId: z.coerce.number({ invalid_type_error: 'Chọn danh mục.' }).int().positive('Chọn danh mục.'),
  publisherId: z
    .coerce.number({ invalid_type_error: 'Chọn nhà xuất bản.' })
    .int()
    .positive('Chọn nhà xuất bản.'),
  price: z.coerce.number().min(0, 'Giá bán không hợp lệ.'),
  discountPrice: z.coerce.number().min(0, 'Giá khuyến mãi không hợp lệ.'),
  stock: z.coerce.number().int('Tồn kho phải là số nguyên.').min(0, 'Tồn kho không hợp lệ.'),
  description: z.string().trim().max(4000, 'Mô tả quá dài.').optional().default(''),
  coverImage: z.string().trim().optional().default(''),
  status: z.enum([BOOK_STATUS.ACTIVE, BOOK_STATUS.INACTIVE]),
}).refine((data) => !data.discountPrice || data.discountPrice <= data.price, {
  path: ['discountPrice'],
  message: 'Giá khuyến mãi không được lớn hơn giá bán.',
});
