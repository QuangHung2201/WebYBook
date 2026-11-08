import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';

const unwrapList = (payload) => {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data : data.items ?? data.content ?? [];
};

export const apiReviewRepository = {
  async getByBook(bookId) {
    const payload = await request({ url: API_ENDPOINTS.reviews.byBook(bookId) });
    return unwrapList(payload);
  },
  async getMine(bookId) {
    const payload = await request({ url: API_ENDPOINTS.reviews.mine(bookId) });
    return payload?.data ?? null;
  },
  async createReview(bookId, data) {
    const payload = await request({
      url: API_ENDPOINTS.reviews.create(bookId),
      method: 'POST',
      data: { rating: data.rating, comment: String(data.comment || '').trim() },
    });
    return payload?.data ?? payload;
  },
  async updateReview(id, data) {
    const payload = await request({
      url: API_ENDPOINTS.reviews.update(id),
      method: 'PUT',
      data: { rating: data.rating, comment: String(data.comment || '').trim() },
    });
    return payload?.data ?? payload;
  },
  async removeReview(id) {
    await request({ url: API_ENDPOINTS.reviews.remove(id), method: 'DELETE' });
    return true;
  },
};
