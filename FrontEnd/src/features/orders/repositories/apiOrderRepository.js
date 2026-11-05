import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';
import {
  mapOrderFromApi,
  mapOrderPageFromApi,
  mapOrderToApi,
} from '@/shared/mappers/orderMapper';

export const apiOrderRepository = {
  async getOrders(params = {}) {
    if (params.userId) {
      const payload = await request({
        url: API_ENDPOINTS.orders.list,
        params: { status: params.status ? String(params.status).toLowerCase() : undefined },
      });
      return mapOrderPageFromApi(payload);
    }
    const payload = await request({
      url: API_ENDPOINTS.admin.orders.list,
      params: { status: params.status ? String(params.status).toLowerCase() : undefined },
    });
    const page = mapOrderPageFromApi(payload);
    const keyword = String(params.keyword || '').trim().toLowerCase();
    if (!keyword) return page;
    const items = page.items.filter((order) =>
      [order.code, order.customerName, order.phone].some((value) =>
        String(value || '').toLowerCase().includes(keyword),
      ),
    );
    return { ...page, items, total: items.length, totalPages: 1 };
  },

  async getOrderById(id, userId = null) {
    const payload = await request({
      url: userId ? API_ENDPOINTS.orders.detail(id) : API_ENDPOINTS.admin.orders.detail(id),
    });
    return mapOrderFromApi(payload?.data ?? payload);
  },

  async createOrder(data) {
    const payload = await request({
      url: API_ENDPOINTS.orders.create,
      method: 'POST',
      data: mapOrderToApi(data),
    });
    return mapOrderFromApi(payload?.data ?? payload);
  },

  async updateStatus(id, status) {
    const payload = await request({
      url: API_ENDPOINTS.admin.orders.updateStatus(id),
      method: 'PUT',
      data: { status: String(status).toLowerCase() },
    });
    return mapOrderFromApi(payload?.data ?? payload);
  },

  async cancelOrder(id) {
    const payload = await request({
      url: API_ENDPOINTS.orders.cancel(id),
      method: 'POST',
    });
    return mapOrderFromApi(payload?.data ?? payload);
  },
};
