import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';

const unwrapList = (payload) => {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data : data.items ?? data.content ?? [];
};

export const apiCategoryRepository = {
  async getCategories() {
    const payload = await request({ url: API_ENDPOINTS.categories.list });
    return unwrapList(payload);
  },
  async createCategory(data) {
    const payload = await request({ url: API_ENDPOINTS.categories.create, method: 'POST', data });
    return payload?.data ?? payload;
  },
  async updateCategory(id, data) {
    const payload = await request({
      url: API_ENDPOINTS.categories.update(id),
      method: 'PUT',
      data,
    });
    return payload?.data ?? payload;
  },
  async deleteCategory(id) {
    await request({ url: API_ENDPOINTS.categories.remove(id), method: 'DELETE' });
    return true;
  },
};
