import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';

const mapResource = (item) => ({
  ...item,
  bio: item.bio ?? item.biography ?? '',
});
const toApi = (data) => ({
  name: data.name,
  biography: data.bio ?? data.biography ?? '',
});
const unwrapList = (payload) => {
  const data = payload?.data ?? payload;
  return (Array.isArray(data) ? data : data.items ?? data.content ?? []).map(mapResource);
};

export const apiAuthorRepository = {
  async getAuthors() {
    const payload = await request({ url: API_ENDPOINTS.authors.list });
    return unwrapList(payload);
  },
  async createAuthor(data) {
    const payload = await request({ url: API_ENDPOINTS.admin.references('authors'), method: 'POST', data: toApi(data) });
    return mapResource(payload?.data ?? payload);
  },
  async updateAuthor(id, data) {
    const payload = await request({ url: API_ENDPOINTS.admin.reference('authors', id), method: 'PUT', data: toApi(data) });
    return mapResource(payload?.data ?? payload);
  },
  async deleteAuthor(id) {
    await request({ url: API_ENDPOINTS.admin.reference('authors', id), method: 'DELETE' });
    return true;
  },
};
