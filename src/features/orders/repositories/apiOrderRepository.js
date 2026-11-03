import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';
import {
  mapOrderFromApi,
  mapOrderPageFromApi,
  mapOrderToApi,
} from '@/shared/mappers/orderMapper';

export const apiOrderRepository = {
  async getOrders(params = {}) {
    const payload = await request({ url: API_ENDPOINTS.orders.list, params });
    return mapOrderPageFromApi(payload);
  },

  async getOrderById(id) {
    const payload = await request({ url: API_ENDPOINTS.orders.detail(id) });
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
      url: API_ENDPOINTS.orders.updateStatus(id),
      method: 'PATCH',
      data: { status },
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
