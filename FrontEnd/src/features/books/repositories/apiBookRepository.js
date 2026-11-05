import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';
import { mapBookFromApi, mapBookPageFromApi, mapBookToApi } from '@/shared/mappers/bookMapper';

export const apiBookRepository = {
  async getBooks(params = {}) {
    const payload = await request({
      url: API_ENDPOINTS.books.list,
      params: {
        search: params.keyword || params.search || '',
        categoryId: params.categoryId || undefined,
        page: params.page || 1,
        limit: params.pageSize || params.limit || 20,
      },
    });
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
      url: API_ENDPOINTS.admin.books.create,
      method: 'POST',
      data: mapBookToApi(data),
    });
    return mapBookFromApi(payload?.data ?? payload);
  },

  async updateBook(id, data) {
    const payload = await request({
      url: API_ENDPOINTS.admin.books.update(id),
      method: 'PUT',
      data: mapBookToApi(data),
    });
    return mapBookFromApi(payload?.data ?? payload);
  },

  async deleteBook(id) {
    await request({ url: API_ENDPOINTS.admin.books.remove(id), method: 'DELETE' });
    return true;
  },

  async updateStock(id, delta) {
    const book = await this.getBookById(id);
    return this.updateBook(id, { ...book, stock: Math.max(0, book.stock + delta) });
  },
};
