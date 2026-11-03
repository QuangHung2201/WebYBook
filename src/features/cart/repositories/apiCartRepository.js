import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';

/**
 * Expected backend shape: { items: [{ book: {...}, qty }], subtotal, count }
 * If the backend returns a different shape, adjust this mapper only.
 */
const mapCart = (payload) => {
  const data = payload?.data ?? payload ?? {};
  const items = data.items ?? data.cartItems ?? [];
  return {
    items: items.map((item) => ({
      book: item.book ?? item.product ?? item,
      qty: Number(item.qty ?? item.quantity) || 1,
    })),
    subtotal: Number(data.subtotal ?? data.total) || 0,
    count: Number(data.count ?? data.totalItems) || 0,
  };
};

export const apiCartRepository = {
  async getCart() {
    const payload = await request({ url: API_ENDPOINTS.cart.get });
    return mapCart(payload);
  },

  async addItem(bookId, qty = 1) {
    const payload = await request({
      url: API_ENDPOINTS.cart.addItem,
      method: 'POST',
      data: { bookId, qty },
    });
    return mapCart(payload);
  },

  async updateItem(bookId, qty) {
    const payload = await request({
      url: API_ENDPOINTS.cart.updateItem(bookId),
      method: 'PUT',
      data: { qty },
    });
    return mapCart(payload);
  },

  async removeItem(bookId) {
    const payload = await request({
      url: API_ENDPOINTS.cart.removeItem(bookId),
      method: 'DELETE',
    });
    return mapCart(payload);
  },

  async clear() {
    const payload = await request({ url: API_ENDPOINTS.cart.clear, method: 'DELETE' });
    return mapCart(payload);
  },
};
