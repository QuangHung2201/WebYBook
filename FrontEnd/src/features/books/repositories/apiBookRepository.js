import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';
import { mapBookFromApi, mapBookPageFromApi, mapBookToApi } from '@/shared/mappers/bookMapper';

export const apiBookRepository = {
  async getBooks(params = {}) {
    const payload = await request({ url: API_ENDPOINTS.books.list, params });
    return mapBookPageFromApi(payload);
  },

  async getBookById(id) {
    const payload = await request({ url: API_ENDPOINTS.books.detail(id) });
    return mapBookFromApi(payload?.data ?? payload);
  },

  async getRelatedBooks(id, limit = 4) {
    const payload = await request({
      url: `${API_ENDPOINTS.books.detail(id)}/related`,
      params: { limit },
    });
    const data = payload?.data ?? payload;
    const items = Array.isArray(data) ? data : data.items ?? [];
    return items.map(mapBookFromApi);
  },

  async createBook(data) {
    const payload = await request({
      url: API_ENDPOINTS.books.create,
      method: 'POST',
      data: mapBookToApi(data),
    });
    return mapBookFromApi(payload?.data ?? payload);
  },

  async updateBook(id, data) {
    const payload = await request({
      url: API_ENDPOINTS.books.update(id),
      method: 'PUT',
      data: mapBookToApi(data),
    });
    return mapBookFromApi(payload?.data ?? payload);
  },

  async deleteBook(id) {
    await request({ url: API_ENDPOINTS.books.remove(id), method: 'DELETE' });
    return true;
  },

  async updateStock() {
    // Stock updates are handled by the backend order service.
    return true;
  },
};
