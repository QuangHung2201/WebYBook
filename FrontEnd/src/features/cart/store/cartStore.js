import { create } from 'zustand';
import { cartService } from '../services/cartService';

const EMPTY = { items: [], subtotal: 0, count: 0 };

/**
 * Đồng bộ giỏ hàng theo người dùng hiện tại. Khi khách đăng nhập, giỏ
 * localStorage được gộp vào giỏ server; khi đăng xuất, giỏ khách được nạp
 * lại. Các component dùng chung store nên cần chống gọi trùng lặp.
 */
let lastSyncedUserId;
let syncingUserId = null;
let syncingPromise = null;

export const useCartStore = create((set, get) => ({
  ...EMPTY,
  loading: false,
  initialized: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const data = await cartService.getCart();
      set({ ...data, loading: false, initialized: true });
    } catch (error) {
      set({
        error: error.message || 'Không thể tải giỏ hàng.',
        loading: false,
        initialized: true,
      });
    }
  },

  syncForUser: (userId) => {
    const key = userId ?? null;
    if (key === lastSyncedUserId) return Promise.resolve();
    if (syncingPromise && syncingUserId === key) return syncingPromise;

    syncingUserId = key;
    const promise = (async () => {
      set({ ...EMPTY, loading: true, error: null });
      try {
        const data = await cartService.getCart();
        set({ ...data, loading: false, initialized: true });
        lastSyncedUserId = key;
      } catch (error) {
        set({
          error: error.message || 'Không thể tải giỏ hàng.',
          loading: false,
          initialized: true,
        });
      } finally {
        if (syncingPromise === promise) {
          syncingPromise = null;
          syncingUserId = null;
        }
      }
    })();

    syncingPromise = promise;
    return promise;
  },

  addItem: async (book, qty = 1) => {
    await cartService.addItem(book, qty);
    await get().fetchCart();
  },

  updateItem: async (bookId, qty) => {
    await cartService.updateItem(bookId, qty);
    await get().fetchCart();
  },

  removeItem: async (bookId) => {
    await cartService.removeItem(bookId);
    await get().fetchCart();
  },

  clear: async () => {
    await cartService.clear();
    set({ ...EMPTY });
  },
}));
