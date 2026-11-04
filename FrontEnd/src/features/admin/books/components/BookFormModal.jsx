import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/components/common/Modal/Modal';
import Button from '@/components/common/Button/Button';
import { Input, Select, Textarea } from '@/components/common/Input/Input';
import BookCover from '@/components/shared/BookCover/BookCover';
import { bookSchema } from '@/features/books/schemas/bookSchema';
import { BOOK_STATUS, BOOK_STATUS_OPTIONS } from '@/data/constants/bookStatus';

const EMPTY_VALUES = {
  title: '',
  authorId: '',
  categoryId: '',
  publisherId: '',
  price: 0,
  discountPrice: 0,
  stock: 0,
  status: BOOK_STATUS.ACTIVE,
  coverImage: '',
  description: '',
};

function toFormValues(book) {
  if (!book) return EMPTY_VALUES;
  return {
    title: book.title || '',
    authorId: String(book.author?.id ?? ''),
    categoryId: String(book.category?.id ?? ''),
    publisherId: String(book.publisher?.id ?? ''),
    price: Number(book.price) || 0,
    discountPrice: Number(book.discountPrice) || 0,
    stock: Number(book.stock) || 0,
    status: book.status || BOOK_STATUS.ACTIVE,
    coverImage: book.coverImage || '',
    description: book.description || '',
  };
}

export default function BookFormModal({ open, book, lookups, saving, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) reset(toFormValues(book));
  }, [open, book, reset]);

  const authorOptions = useMemo(
    () => lookups.authors.map((item) => ({ value: String(item.id), label: item.name })),
    [lookups.authors],
  );
  const categoryOptions = useMemo(
    () => lookups.categories.map((item) => ({ value: String(item.id), label: item.name })),
    [lookups.categories],
  );
  const publisherOptions = useMemo(
    () => lookups.publishers.map((item) => ({ value: String(item.id), label: item.name })),
    [lookups.publishers],
  );

  const title = watch('title');
  const coverImage = watch('coverImage');
  const authorId = watch('authorId');
  const authorName = lookups.authors.find((item) => String(item.id) === String(authorId))?.name;

  const submit = handleSubmit(async (values) => {
    const ok = await onSubmit(values);
    if (ok) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={book ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button type="submit" form="admin-book-form" loading={saving}>
            {book ? 'Lưu thay đổi' : 'Thêm sách'}
          </Button>
        </>
      }
    >
      <form id="admin-book-form" className="admin-form-grid" onSubmit={submit} noValidate>
        <div className="admin-form-section">
          <span className="admin-form-section__title">Thông tin cơ bản</span>
          <Input
            label="Tên sách"
            placeholder="Ví dụ: Nhà giả kim"
            error={errors.title?.message}
            {...register('title')}
          />
          <div className="admin-form-row">
            <Select
              label="Tác giả"
              placeholder="Chọn tác giả"
              options={authorOptions}
              error={errors.authorId?.message}
              {...register('authorId')}
            />
            <Select
              label="Danh mục"
              placeholder="Chọn danh mục"
              options={categoryOptions}
              error={errors.categoryId?.message}
              {...register('categoryId')}
            />
          </div>
          <Select
            label="Nhà xuất bản"
            placeholder="Chọn nhà xuất bản"
            options={publisherOptions}
            error={errors.publisherId?.message}
            {...register('publisherId')}
          />
        </div>

        <div className="admin-form-section">
          <span className="admin-form-section__title">Giá và tồn kho</span>
          <div className="admin-form-row">
            <Input
              label="Giá bán (₫)"
              type="number"
              min="0"
              step="1000"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="Giá khuyến mãi (₫)"
              type="number"
              min="0"
              step="1000"
              hint="Để 0 nếu không giảm giá."
              error={errors.discountPrice?.message}
              {...register('discountPrice')}
            />
          </div>
          <div className="admin-form-row">
            <Input
              label="Tồn kho"
              type="number"
              min="0"
              step="1"
              error={errors.stock?.message}
              {...register('stock')}
            />
            <Select
              label="Trạng thái"
              options={BOOK_STATUS_OPTIONS}
              error={errors.status?.message}
              {...register('status')}
            />
          </div>
        </div>

        <div className="admin-form-section">
          <span className="admin-form-section__title">Nội dung và hình ảnh</span>
          <div className="admin-cover-preview">
            <span className="admin-cover-preview__image">
              <BookCover title={title || 'Sách mới'} author={authorName} coverImage={coverImage} />
            </span>
            <p>
              Bìa sách được tạo tự động từ tên sách nếu bạn không nhập đường dẫn ảnh. Bạn có thể dán
              URL ảnh bìa bên dưới.
            </p>
          </div>
          <Input
            label="Đường dẫn ảnh bìa"
            placeholder="https://..."
            error={errors.coverImage?.message}
            {...register('coverImage')}
          />
          <Textarea
            label="Mô tả"
            rows={5}
            placeholder="Tóm tắt nội dung, điểm nổi bật của cuốn sách..."
            error={errors.description?.message}
            {...register('description')}
          />
        </div>
      </form>
    </Modal>
  );
}
