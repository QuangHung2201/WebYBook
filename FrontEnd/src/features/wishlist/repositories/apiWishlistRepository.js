import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';
import { mapBookFromApi } from '@/shared/mappers/bookMapper';

const unwrapList = (payload) => {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data : data.items ?? data.content ?? [];
};

export const apiWishlistRepository = {
  async getWishlist() {
    const payload = await request({ url: API_ENDPOINTS.wishlist.list });
    return unwrapList(payload).map(mapBookFromApi).filter(Boolean);
  },

  async add(userId, bookId) {
    await request({
      url: API_ENDPOINTS.wishlist.add,
      method: 'POST',
      data: { bookId },
    });
    return true;
  },

  async remove(userId, bookId) {
    await request({ url: API_ENDPOINTS.wishlist.remove(bookId), method: 'DELETE' });
    return true;
  },
};
