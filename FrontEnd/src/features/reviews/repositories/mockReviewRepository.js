import {
  deepClone,
  delay,
  nextId,
  readCollection,
  writeCollection,
} from '@/infrastructure/storage/mockCollection';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';
import { reviewsMock } from '@/data/mock/reviews.mock';
import { booksMock } from '@/data/mock/books.mock';

const read = () => readCollection(STORAGE_KEYS.REVIEWS, reviewsMock);

function syncBookRating(bookId) {
  const reviews = read().filter((review) => String(review.bookId) === String(bookId));
  const books = readCollection(STORAGE_KEYS.BOOKS, booksMock);
  const index = books.findIndex((book) => String(book.id) === String(bookId));
  if (index === -1) return;

  const reviewCount = reviews.length;
  const rating = reviewCount
    ? Math.round((reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviewCount) * 10) / 10
    : 0;

  books[index] = { ...books[index], rating, reviewCount };
  writeCollection(STORAGE_KEYS.BOOKS, books);
}

export const mockReviewRepository = {
  async getByBook(bookId) {
    await delay(200);
    return deepClone(
      read()
        .filter(
          (review) =>
            String(review.bookId) === String(bookId) && review.status !== 'pending',
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    );
  },

  async getMine(bookId, userId) {
    await delay(120);
    if (userId === null || userId === undefined) return null;
    const review = read().find(
      (item) =>
        String(item.bookId) === String(bookId) && String(item.userId) === String(userId),
    );
    return review ? deepClone(review) : null;
  },

  async createReview(bookId, data) {
    await delay(320);
    const reviews = read();
    const existingIndex = reviews.findIndex(
      (item) =>
        String(item.bookId) === String(bookId) &&
        data.userId !== undefined &&
        String(item.userId) === String(data.userId),
    );
    if (existingIndex !== -1) {
      const updated = {
        ...reviews[existingIndex],
        rating: Number(data.rating),
        comment: data.comment?.trim() || '',
        status: 'pending',
        updatedAt: new Date().toISOString(),
      };
      // Giữ nguyên vị trí để danh sách không nhảy khi cập nhật.
      reviews[existingIndex] = updated;
      writeCollection(STORAGE_KEYS.REVIEWS, reviews);
      syncBookRating(bookId);
      return deepClone(updated);
    }
    const review = {
      id: nextId(reviews),
      bookId: Number(bookId),
      userId: data.userId,
      userName: data.userName,
      rating: Number(data.rating),
      comment: data.comment?.trim() || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeCollection(STORAGE_KEYS.REVIEWS, [review, ...reviews]);
    syncBookRating(bookId);
    return deepClone(review);
  },

  async updateReview(id, data) {
    await delay(280);
    const reviews = read();
    const index = reviews.findIndex((item) => String(item.id) === String(id));
    if (index === -1) throw new Error('Không tìm thấy đánh giá.');
    if (
      data.userId !== null &&
      data.userId !== undefined &&
      String(reviews[index].userId) !== String(data.userId)
    ) {
      throw new Error('Bạn không có quyền sửa đánh giá này.');
    }
    reviews[index] = {
      ...reviews[index],
      rating: Number(data.rating),
      comment: data.comment?.trim() || '',
      status: 'pending',
      updatedAt: new Date().toISOString(),
    };
    writeCollection(STORAGE_KEYS.REVIEWS, reviews);
    syncBookRating(reviews[index].bookId);
    return deepClone(reviews[index]);
  },

  async removeReview(id, userId) {
    await delay(260);
    const reviews = read();
    const review = reviews.find((item) => String(item.id) === String(id));
    if (!review) throw new Error('Không tìm thấy đánh giá.');
    if (userId !== null && userId !== undefined && String(review.userId) !== String(userId)) {
      throw new Error('Bạn không có quyền xóa đánh giá này.');
    }
    writeCollection(
      STORAGE_KEYS.REVIEWS,
      reviews.filter((item) => String(item.id) !== String(id)),
    );
    syncBookRating(review.bookId);
    return true;
  },
};
