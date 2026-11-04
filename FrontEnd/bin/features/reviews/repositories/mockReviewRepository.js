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
        .filter((review) => String(review.bookId) === String(bookId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    );
  },

  async createReview(bookId, data) {
    await delay(320);
    const reviews = read();
    const review = {
      id: nextId(reviews),
      bookId: Number(bookId),
      userId: data.userId,
      userName: data.userName,
      rating: Number(data.rating),
      comment: data.comment?.trim() || '',
      createdAt: new Date().toISOString(),
    };
    writeCollection(STORAGE_KEYS.REVIEWS, [review, ...reviews]);
    syncBookRating(bookId);
    return deepClone(review);
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
