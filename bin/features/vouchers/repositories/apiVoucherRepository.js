import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';

const unwrapList = (payload) => {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data : data.items ?? data.content ?? [];
};

export const apiVoucherRepository = {
  async getVouchers() {
    const payload = await request({ url: API_ENDPOINTS.vouchers.list });
    return unwrapList(payload);
  },
  async validateVoucher(data) {
    const payload = await request({
      url: API_ENDPOINTS.vouchers.validate,
      method: 'POST',
      data,
    });
    return payload?.data ?? payload;
  },
  async createVoucher(data) {
    const payload = await request({ url: API_ENDPOINTS.vouchers.create, method: 'POST', data });
    return payload?.data ?? payload;
  },
  async updateVoucher(id, data) {
    const payload = await request({ url: API_ENDPOINTS.vouchers.update(id), method: 'PUT', data });
    return payload?.data ?? payload;
  },
  async deleteVoucher(id) {
    await request({ url: API_ENDPOINTS.vouchers.remove(id), method: 'DELETE' });
    return true;
  },
};
