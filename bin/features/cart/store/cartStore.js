import { create } from 'zustand';
import { cartService } from '../services/cartService';

const EMPTY = { items: [], subtotal: 0, count: 0 };

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

  addItem: async (book, qty = 1) => {
    await cartService.addItem(book.id, qty);
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
