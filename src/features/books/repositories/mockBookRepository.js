import {
  deepClone,
  delay,
  nextId,
  readCollection,
  writeCollection,
} from '@/infrastructure/storage/mockCollection';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';
import { booksMock } from '@/data/mock/books.mock';
import { BOOK_STATUS } from '@/data/constants/bookStatus';
import { normalizeKeyword } from '@/shared/utils/validators';

const read = () => readCollection(STORAGE_KEYS.BOOKS, booksMock);

const priceOf = (book) => Number(book.discountPrice) || Number(book.price) || 0;

function applyFilters(items, params) {
  const {
    keyword = '',
    categoryId = null,
    authorId = null,
    publisherId = null,
    minPrice = null,
    maxPrice = null,
    status = null,
  } = params;

  let result = items;

  if (status) result = result.filter((book) => book.status === status);
  if (categoryId) result = result.filter((book) => String(book.category?.id) === String(categoryId));
  if (authorId) result = result.filter((book) => String(book.author?.id) === String(authorId));
  if (publisherId) result = result.filter((book) => String(book.publisher?.id) === String(publisherId));

  if (keyword) {
    const needle = normalizeKeyword(keyword);
    result = result.filter((book) =>
      [book.title, book.author?.name, book.category?.name, book.publisher?.name]
        .map(normalizeKeyword)
        .some((value) => value.includes(needle)),
    );
  }

  if (minPrice !== null && minPrice !== '') {
    result = result.filter((book) => priceOf(book) >= Number(minPrice));
  }
  if (maxPrice !== null && maxPrice !== '') {
    result = result.filter((book) => priceOf(book) <= Number(maxPrice));
  }

  return result;
}

function applySort(items, sort) {
  const sorted = [...items];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => priceOf(a) - priceOf(b));
    case 'price-desc':
      return sorted.sort((a, b) => priceOf(b) - priceOf(a));
    case 'bestseller':
      return sorted.sort((a, b) => Number(b.sold) - Number(a.sold));
    case 'rating':
      return sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export const mockBookRepository = {
  async getBooks(params = {}) {
    await delay();
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.max(1, Number(params.pageSize) || 12);

    const filtered = applySort(applyFilters(read(), params), params.sort);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      items: deepClone(filtered.slice(start, start + pageSize)),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  },

  async getBookById(id) {
    await delay(220);
    const book = read().find((item) => String(item.id) === String(id));
    if (!book) throw new Error('Không tìm thấy sách.');
    return deepClone(book);
  },

  async getRelatedBooks(id, limit = 4) {
    await delay(180);
    const books = read();
    const current = books.find((item) => String(item.id) === String(id));
    if (!current) return [];
    return deepClone(
      books
        .filter(
          (item) =>
            String(item.id) !== String(id) &&
            item.category?.id === current.category?.id &&
            item.status === BOOK_STATUS.ACTIVE,
        )
        .sort((a, b) => Number(b.sold) - Number(a.sold))
        .slice(0, limit),
    );
  },

  async createBook(data) {
    await delay(360);
    const books = read();
    const book = {
      id: nextId(books),
      title: data.title,
      author: { id: Number(data.authorId), name: data.authorName || '' },
      category: { id: Number(data.categoryId), name: data.categoryName || '' },
      publisher: { id: Number(data.publisherId), name: data.publisherName || '' },
      price: Number(data.price) || 0,
      discountPrice: Number(data.discountPrice) || 0,
      stock: Number(data.stock) || 0,
      coverImage: data.coverImage || '',
      description: data.description || '',
      rating: 0,
      reviewCount: 0,
      sold: 0,
      status: data.status || BOOK_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
    };
    writeCollection(STORAGE_KEYS.BOOKS, [book, ...books]);
    return deepClone(book);
  },

  async updateBook(id, data) {
    await delay(360);
    const books = read();
    const index = books.findIndex((item) => String(item.id) === String(id));
    if (index === -1) throw new Error('Không tìm thấy sách để cập nhật.');

    const updated = {
      ...books[index],
      ...data,
      author: data.authorId
        ? { id: Number(data.authorId), name: data.authorName || books[index].author?.name || '' }
        : books[index].author,
      category: data.categoryId
        ? { id: Number(data.categoryId), name: data.categoryName || books[index].category?.name || '' }
        : books[index].category,
      publisher: data.publisherId
        ? { id: Number(data.publisherId), name: data.publisherName || books[index].publisher?.name || '' }
        : books[index].publisher,
      price: data.price !== undefined ? Number(data.price) : books[index].price,
      discountPrice:
        data.discountPrice !== undefined ? Number(data.discountPrice) : books[index].discountPrice,
      stock: data.stock !== undefined ? Number(data.stock) : books[index].stock,
    };

    books[index] = updated;
    writeCollection(STORAGE_KEYS.BOOKS, books);
    return deepClone(updated);
  },

  async deleteBook(id) {
    await delay(300);
    const books = read();
    const next = books.filter((item) => String(item.id) !== String(id));
    if (next.length === books.length) throw new Error('Không tìm thấy sách để xóa.');
    writeCollection(STORAGE_KEYS.BOOKS, next);
    return true;
  },

  async updateStock(id, delta) {
    const books = read();
    const index = books.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return;
    books[index] = {
      ...books[index],
      stock: Math.max(0, Number(books[index].stock) + Number(delta)),
    };
    writeCollection(STORAGE_KEYS.BOOKS, books);
  },
};
