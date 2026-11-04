import { localStorageAdapter } from '@/infrastructure/storage/localStorageAdapter';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';
import { deepClone, delay, readCollection } from '@/infrastructure/storage/mockCollection';
import { booksMock } from '@/data/mock/books.mock';
import { appConfig } from '@/infrastructure/config/appConfig';

const MAX_QTY = appConfig.cart.maxQuantityPerItem;

const readQuantities = () => localStorageAdapter.get(STORAGE_KEYS.CART, {});
const writeQuantities = (quantities) => localStorageAdapter.set(STORAGE_KEYS.CART, quantities);

const readBooks = () => readCollection(STORAGE_KEYS.BOOKS, booksMock);

const effectivePrice = (book) => Number(book.discountPrice) || Number(book.price) || 0;

function buildCart() {
  const quantities = readQuantities();
  const books = readBooks();

  const items = Object.entries(quantities)
    .map(([bookId, qty]) => {
      const book = books.find((item) => String(item.id) === String(bookId));
      if (!book) return null;
      const safeQty = Math.max(1, Math.min(Number(qty) || 1, Number(book.stock) || 0, MAX_QTY));
      if (safeQty <= 0) return null;
      return { book: deepClone(book), qty: safeQty };
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + effectivePrice(item.book) * item.qty, 0);
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  return { items, subtotal, count };
}

export const mockCartRepository = {
  async getCart() {
    await delay(120);
    return buildCart();
  },

  async addItem(bookId, qty = 1) {
    await delay(180);
    const book = readBooks().find((item) => String(item.id) === String(bookId));
    if (!book) throw new Error('Không tìm thấy sách.');
    if (Number(book.stock) <= 0) throw new Error('Sách này đã hết hàng.');

    const quantities = readQuantities();
    const current = Number(quantities[bookId]) || 0;
    const next = Math.min(current + Math.max(1, Number(qty) || 1), Number(book.stock), MAX_QTY);
    writeQuantities({ ...quantities, [bookId]: next });
    return buildCart();
  },

  async updateItem(bookId, qty) {
    await delay(140);
    const quantities = readQuantities();
    const numericQty = Number(qty);

    if (!numericQty || numericQty <= 0) {
      delete quantities[bookId];
      writeQuantities(quantities);
      return buildCart();
    }

    const book = readBooks().find((item) => String(item.id) === String(bookId));
    if (!book) throw new Error('Không tìm thấy sách.');

    quantities[bookId] = Math.min(numericQty, Number(book.stock), MAX_QTY);
    writeQuantities(quantities);
    return buildCart();
  },

  async removeItem(bookId) {
    await delay(140);
    const quantities = readQuantities();
    delete quantities[bookId];
    writeQuantities(quantities);
    return buildCart();
  },

  async clear() {
    await delay(120);
    writeQuantities({});
    return { items: [], subtotal: 0, count: 0 };
  },
};
