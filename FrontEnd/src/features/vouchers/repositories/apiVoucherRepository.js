import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';

const unwrapList = (payload) => {
  const data = payload?.data ?? payload;
  const items = Array.isArray(data) ? data : data.items ?? data.content ?? [];
  return items.map(mapVoucherFromApi);
};

const toApiVoucher = (data) => ({
  code: data.code?.trim().toUpperCase(),
  name: data.name?.trim(),
  description: data.description?.trim() || '',
  discountType: data.type === 'PERCENT' ? 'percentage' : 'fixed',
  discountValue: Number(data.value),
  minimumOrderAmount: Number(data.minOrder),
  maximumDiscount: Number(data.maxDiscount) || null,
  usageLimit: Number(data.quantity),
  startDate: `${data.startDate}T00:00:00`,
  endDate: `${data.endDate}T23:59:59`,
  status: data.status?.toLowerCase(),
});

const mapVoucherFromApi = (voucher) => ({
  ...voucher,
  name: voucher.name || voucher.code,
  description: voucher.description || '',
  type: voucher.discount_type === 'percentage' ? 'PERCENT' : 'FIXED',
  value: Number(voucher.discount_value),
  minOrder: Number(voucher.minimum_order_amount),
  maxDiscount: Number(voucher.maximum_discount) || 0,
  quantity: Number(voucher.usage_limit) || 0,
  used: Number(voucher.used_count) || 0,
  startDate: voucher.start_date,
  endDate: voucher.end_date,
  status: String(voucher.status || '').toUpperCase(),
});

export const apiVoucherRepository = {
  async getVouchers() {
    const payload = await request({ url: API_ENDPOINTS.admin.vouchers.list });
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
    const payload = await request({
      url: API_ENDPOINTS.admin.vouchers.create,
      method: 'POST',
      data: toApiVoucher(data),
    });
    return mapVoucherFromApi(payload?.data ?? payload);
  },
  async updateVoucher(id, data) {
    const payload = await request({
      url: API_ENDPOINTS.admin.vouchers.update(id),
      method: 'PUT',
      data: toApiVoucher(data),
    });
    return mapVoucherFromApi(payload?.data ?? payload);
  },
  async deleteVoucher(id) {
    await request({ url: API_ENDPOINTS.admin.vouchers.remove(id), method: 'DELETE' });
    return true;
  },
};
