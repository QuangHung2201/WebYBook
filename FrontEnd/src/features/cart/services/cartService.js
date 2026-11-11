import { cartRepository } from '../repositories/cartRepository';
import { apiCartRepository } from '../repositories/apiCartRepository';
import { guestCartRepository } from '../repositories/guestCartRepository';
import { isApiDataSource } from '@/infrastructure/config/environment';
import { localStorageAdapter } from '@/infrastructure/storage/localStorageAdapter';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';

const hasToken = () => Boolean(localStorageAdapter.get(STORAGE_KEYS.AUTH_TOKEN, null));

/**
 * - Chế độ mock: giữ nguyên repository mock hiện tại.
 * - Chế độ API: khách chưa đăng nhập dùng giỏ localStorage; khách đã đăng
 *   nhập dùng API server. Khi đăng nhập, giỏ khách được gộp vào giỏ server.
 */
const activeRepository = () => {
  if (!isApiDataSource()) return cartRepository;
  return hasToken() ? apiCartRepository : guestCartRepository;
};

export const cartService = {
  getCart: async () => {
    if (isApiDataSource() && hasToken()) {
      await cartService.mergeGuestCart();
    }
    return activeRepository().getCart();
  },
  addItem: (book, qty = 1) => activeRepository().addItem(book, qty),
  updateItem: (bookId, qty) => activeRepository().updateItem(bookId, qty),
  removeItem: (bookId) => activeRepository().removeItem(bookId),
  clear: () => activeRepository().clear(),

  /**
   * Gộp giỏ khách (localStorage) vào giỏ server. Item không gộp được (hết
   * hàng, vượt tồn kho) được giữ lại trong localStorage để không mất dữ liệu
   * của khách.
   */
  async mergeGuestCart() {
    if (!isApiDataSource() || !hasToken()) return;
    const entries = guestCartRepository.getEntries();
    if (!entries.length) return;

    const mergedIds = [];
    for (const entry of entries) {
      try {
        await apiCartRepository.addItem(entry.bookId, entry.qty);
        mergedIds.push(entry.bookId);
      } catch {
        // Giữ item lỗi lại cho lần đăng nhập sau; không chặn các item khác.
      }
    }
    if (mergedIds.length) {
      guestCartRepository.removeEntries(mergedIds);
    }
  },
};
