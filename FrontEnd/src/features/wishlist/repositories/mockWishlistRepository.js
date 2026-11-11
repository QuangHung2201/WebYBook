import { localStorageAdapter } from '@/infrastructure/storage/localStorageAdapter';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';
import { readCollection } from '@/infrastructure/storage/mockCollection';
import { booksMock } from '@/data/mock/books.mock';

const readAll = () => {
  const value = localStorageAdapter.get(STORAGE_KEYS.WISHLIST, {});
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
};

const readIds = (userId) => {
  const ids = readAll()[String(userId ?? 'guest')];
  return Array.isArray(ids) ? ids.map(String) : [];
};

const writeIds = (userId, ids) => {
  localStorageAdapter.set(STORAGE_KEYS.WISHLIST, {
    ...readAll(),
    [String(userId ?? 'guest')]: ids,
  });
};

export const mockWishlistRepository = {
  async getWishlist(userId) {
    const books = readCollection(STORAGE_KEYS.BOOKS, booksMock);
    return readIds(userId)
      .map((id) => books.find((book) => String(book.id) === id))
      .filter(Boolean);
  },

  async add(userId, bookId) {
    const ids = readIds(userId);
    if (!ids.includes(String(bookId))) {
      writeIds(userId, [String(bookId), ...ids]);
    }
    return true;
  },

  async remove(userId, bookId) {
    writeIds(
      userId,
      readIds(userId).filter((id) => id !== String(bookId)),
    );
    return true;
  },
};
