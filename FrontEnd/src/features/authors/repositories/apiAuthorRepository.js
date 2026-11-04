import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';

const unwrapList = (payload) => {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data : data.items ?? data.content ?? [];
};

export const apiAuthorRepository = {
  async getAuthors() {
    const payload = await request({ url: API_ENDPOINTS.authors.list });
    return unwrapList(payload);
  },
  async createAuthor(data) {
    const payload = await request({ url: API_ENDPOINTS.authors.create, method: 'POST', data });
    return payload?.data ?? payload;
  },
  async updateAuthor(id, data) {
    const payload = await request({ url: API_ENDPOINTS.authors.update(id), method: 'PUT', data });
    return payload?.data ?? payload;
  },
  async deleteAuthor(id) {
    await request({ url: API_ENDPOINTS.authors.remove(id), method: 'DELETE' });
    return true;
  },
};
