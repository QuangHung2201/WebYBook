import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';

const unwrapList = (payload) => {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data : data.items ?? data.content ?? [];
};

export const apiPublisherRepository = {
  async getPublishers() {
    const payload = await request({ url: API_ENDPOINTS.publishers.list });
    return unwrapList(payload);
  },
  async createPublisher(data) {
    const payload = await request({ url: API_ENDPOINTS.publishers.create, method: 'POST', data });
    return payload?.data ?? payload;
  },
  async updatePublisher(id, data) {
    const payload = await request({ url: API_ENDPOINTS.publishers.update(id), method: 'PUT', data });
    return payload?.data ?? payload;
  },
  async deletePublisher(id) {
    await request({ url: API_ENDPOINTS.publishers.remove(id), method: 'DELETE' });
    return true;
  },
};
