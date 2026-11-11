import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';
import { mapBookFromApi } from '@/shared/mappers/bookMapper';

/**
 * Backend trả về item phẳng ({ bookId, qty, title, price... }) hoặc item lồng
 * ({ book: {...}, qty }). Chuẩn hóa cả hai về model Book của ứng dụng.
 */
const mapCartItem = (item) => {
  const rawBook = item.book ?? item.product ?? item;
  return {
    book: mapBookFromApi({
      ...rawBook,
      id: rawBook.id ?? item.bookId,
    }),
    qty: Number(item.qty ?? item.quantity) || 1,
  };
};

const mapCart = (payload) => {
  const data = payload?.data ?? payload ?? {};
  const items = data.items ?? data.cartItems ?? [];
  return {
    items: items.map(mapCartItem),
    subtotal: Number(data.subtotal ?? data.total) || 0,
    count: Number(data.count ?? data.totalItems) || 0,
  };
};

export const apiCartRepository = {
  async getCart() {
    const payload = await request({ url: API_ENDPOINTS.cart.get });
    return mapCart(payload);
  },

  async addItem(book, qty = 1) {
    const bookId = typeof book === 'object' ? book.id : book;
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
