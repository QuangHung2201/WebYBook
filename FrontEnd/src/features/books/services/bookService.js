import { bookRepository } from '../repositories/bookRepository';
import { BOOK_STATUS } from '@/data/constants/bookStatus';

export const bookService = {
  getBooks(params = {}) {
    return bookRepository.getBooks({
      page: 1,
      pageSize: 12,
      sort: 'newest',
      ...params,
    });
  },

  getStoreBooks(params = {}) {
    return bookRepository.getBooks({
      page: 1,
      pageSize: 12,
      sort: 'newest',
      status: BOOK_STATUS.ACTIVE,
      ...params,
    });
  },

  getBookById(id) {
    return bookRepository.getBookById(id);
  },

  getStoreBookById(id) {
    return bookRepository.getBookById(id, { status: BOOK_STATUS.ACTIVE });
  },

  getRelatedBooks(id, limit = 4) {
    return bookRepository.getRelatedBooks(id, limit);
  },

  searchBooks(keyword, params = {}) {
    return bookRepository.getBooks({
      status: BOOK_STATUS.ACTIVE,
      page: 1,
      pageSize: 12,
      sort: 'newest',
      ...params,
      keyword,
    });
  },

  createBook(data) {
    return bookRepository.createBook(data);
  },

  updateBook(id, data) {
    return bookRepository.updateBook(id, data);
  },

  deleteBook(id) {
    return bookRepository.deleteBook(id);
  },

  updateStock(id, delta) {
    return bookRepository.updateStock(id, delta);
  },
};
