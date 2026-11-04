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
  async createReview(bookId, data) {
    const payload = await request({
      url: API_ENDPOINTS.reviews.create(bookId),
      method: 'POST',
      data,
    });
    return payload?.data ?? payload;
  },
  async removeReview(id) {
    await request({ url: API_ENDPOINTS.reviews.remove(id), method: 'DELETE' });
    return true;
  },
};
