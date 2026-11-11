import { localStorageAdapter } from '@/infrastructure/storage/localStorageAdapter';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';
import { appConfig } from '@/infrastructure/config/appConfig';
import { apiBookRepository } from '@/features/books/repositories/apiBookRepository';
import { BOOK_STATUS } from '@/data/constants/bookStatus';

const MAX_QTY = appConfig.cart.maxQuantityPerItem;

const readEntries = () => localStorageAdapter.get(STORAGE_KEYS.GUEST_CART, {});
const writeEntries = (entries) => localStorageAdapter.set(STORAGE_KEYS.GUEST_CART, entries);

const effectivePrice = (book) => Number(book?.discountPrice) || Number(book?.price) || 0;

const snapshot = (book) => ({
  id: book.id,
  title: book.title || '',
  coverImage: book.coverImage || '',
  price: Number(book.price) || 0,
  discountPrice: Number(book.discountPrice) || 0,
  stock: Number(book.stock) || 0,
  status: book.status || BOOK_STATUS.ACTIVE,
  category: { name: book.category?.name || '' },
  author: { name: book.author?.name || '' },
});

async function refreshEntries() {
  const entries = readEntries();
  const refreshed = { ...entries };

  await Promise.all(Object.entries(entries).map(async ([bookId, entry]) => {
    if (!entry?.book) {
      delete refreshed[bookId];
      return;
    }

    try {
      const book = await apiBookRepository.getBookById(bookId, { status: BOOK_STATUS.ACTIVE });
      refreshed[bookId] = { ...entry, book: snapshot(book) };
    } catch (error) {
      if (!String(error.message).toLowerCase().includes('không tìm thấy sách')) throw error;
      refreshed[bookId] = {
        ...entry,
        book: { ...entry.book, stock: 0, status: 'UNAVAILABLE' },
      };
    }
  }));

  writeEntries(refreshed);
}

function buildCart() {
  const entries = readEntries();
  const items = Object.entries(entries)
    .map(([bookId, entry]) => {
      const book = entry?.book;
      if (!book) return null;
      const qty = Math.max(1, Math.min(Number(entry.qty) || 1, MAX_QTY));
      return { book: { ...book, id: book.id ?? Number(bookId) }, qty };
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + effectivePrice(item.book) * item.qty, 0);
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  return { items, subtotal, count };
}

export const guestCartRepository = {
  async getCart() {
    await refreshEntries();
    return buildCart();
  },

  async addItem(book, qty = 1) {
    const bookId = typeof book === 'object' && book !== null ? book.id : book;
    if (bookId === undefined || bookId === null) {
      throw new Error('Không tìm thấy sách.');
    }
    const currentBook = await apiBookRepository.getBookById(bookId, { status: BOOK_STATUS.ACTIVE });
    const stock = Number(currentBook.stock) || 0;
    if (stock <= 0) {
      throw new Error('Sách này đã hết hàng.');
    }
    const entries = readEntries();
    const current = Number(entries[bookId]?.qty) || 0;
    const requested = Math.max(1, Number(qty) || 1);
    if (current + requested > stock) {
      throw new Error(`Sách chỉ còn ${stock} cuốn trong kho.`);
    }
    const next = Math.min(current + requested, stock, MAX_QTY);
    writeEntries({
      ...entries,
      [bookId]: { qty: next, book: snapshot(currentBook) },
    });
    return buildCart();
  },

  async updateItem(bookId, qty) {
    const entries = readEntries();
    const entry = entries[bookId];
    if (!entry) return buildCart();
    const numericQty = Number(qty);
    if (!numericQty || numericQty <= 0) {
      delete entries[bookId];
      writeEntries(entries);
      return buildCart();
    }
    const book = await apiBookRepository.getBookById(bookId, { status: BOOK_STATUS.ACTIVE });
    const stock = Number(book.stock) || 0;
    if (stock <= 0) {
      throw new Error('Sách này đã hết hàng.');
    }
    if (numericQty > stock) {
      throw new Error(`Sách chỉ còn ${stock} cuốn trong kho.`);
    }
    entries[bookId] = {
      ...entry,
      book: snapshot(book),
      qty: Math.min(numericQty, MAX_QTY),
    };
    writeEntries(entries);
    return buildCart();
  },

  async removeItem(bookId) {
    const entries = readEntries();
    delete entries[bookId];
    writeEntries(entries);
    return buildCart();
  },

  async clear() {
    writeEntries({});
    return { items: [], subtotal: 0, count: 0 };
  },

  getEntries() {
    const entries = readEntries();
    return Object.entries(entries).map(([bookId, entry]) => ({
      bookId: Number(bookId) || bookId,
      qty: Number(entry?.qty) || 1,
    }));
  },

  removeEntries(bookIds) {
    const entries = readEntries();
    for (const bookId of bookIds) {
      delete entries[bookId];
    }
    writeEntries(entries);
  },
};
