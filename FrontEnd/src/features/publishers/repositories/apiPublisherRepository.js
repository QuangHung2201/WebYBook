import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';

const unwrapList = (payload) => {
  const data = payload?.data ?? payload;
  return (Array.isArray(data) ? data : data.items ?? data.content ?? []).map((item) => ({
    ...item,
    website: item.website ?? item.description ?? '',
  }));
};

export const apiPublisherRepository = {
  async getPublishers() {
    const payload = await request({ url: API_ENDPOINTS.publishers.list });
    return unwrapList(payload);
  },
  async createPublisher(data) {
    const payload = await request({
      url: API_ENDPOINTS.admin.references('publishers'),
      method: 'POST',
      data: { name: data.name, address: data.address, description: data.website || '' },
    });
    return payload?.data ?? payload;
  },
  async updatePublisher(id, data) {
    const payload = await request({
      url: API_ENDPOINTS.admin.reference('publishers', id),
      method: 'PUT',
      data: { name: data.name, address: data.address, description: data.website || '' },
    });
    return payload?.data ?? payload;
  },
  async deletePublisher(id) {
    await request({ url: API_ENDPOINTS.admin.reference('publishers', id), method: 'DELETE' });
    return true;
  },
};
