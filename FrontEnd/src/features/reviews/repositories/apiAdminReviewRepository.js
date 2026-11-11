import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';

const unwrap = (payload) => {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data : data.items ?? data.content ?? [];
};

const mapReview = (review) => ({
  ...review,
  id: review.id,
  userId: review.userId ?? review.user_id,
  userName: review.userName ?? review.full_name ?? review.fullName,
  bookId: review.bookId ?? review.book_id,
  bookTitle: review.bookTitle ?? review.title,
  orderId: review.orderId ?? review.order_id,
  rating: Number(review.rating) || 0,
  status: String(review.status || '').toLowerCase(),
  comment: review.comment || '',
  createdAt: review.createdAt ?? review.created_at,
  updatedAt: review.updatedAt ?? review.updated_at,
});

export const apiAdminReviewRepository = {
  async list(params = {}) {
    const payload = await request({
      url: API_ENDPOINTS.adminReviews.list,
      params: { status: params.status || undefined, search: params.search || undefined },
    });
    return unwrap(payload).map(mapReview);
  },

  async updateStatus(id, status) {
    const payload = await request({
      url: API_ENDPOINTS.adminReviews.updateStatus(id),
      method: 'PUT',
      data: { status },
    });
    return mapReview(payload?.data ?? payload);
  },

  async remove(id) {
    await request({ url: API_ENDPOINTS.adminReviews.remove(id), method: 'DELETE' });
    return true;
  },
};
