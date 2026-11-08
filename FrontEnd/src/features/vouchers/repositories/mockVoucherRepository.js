import {
  deepClone,
  delay,
  nextId,
  readCollection,
  writeCollection,
} from '@/infrastructure/storage/mockCollection';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';
import { vouchersMock } from '@/data/mock/vouchers.mock';
import { VOUCHER_STATUS, VOUCHER_TYPE } from '@/data/constants/voucherStatus';

const read = () => readCollection(STORAGE_KEYS.VOUCHERS, vouchersMock);

export const mockVoucherRepository = {
  async getVouchers() {
    await delay(200);
    return deepClone(read());
  },

  async getAvailableVouchers(subtotal) {
    await delay(180);
    const now = new Date();
    return deepClone(
      read().filter((voucher) => {
        if (voucher.status !== VOUCHER_STATUS.ACTIVE) return false;
        if (new Date(voucher.startDate) > now || new Date(voucher.endDate) < now) return false;
        if (Number(voucher.quantity) > 0 && Number(voucher.used) >= Number(voucher.quantity)) {
          return false;
        }
        if (subtotal !== '' && subtotal !== null && subtotal !== undefined) {
          if (Number(voucher.minOrder) > Number(subtotal)) return false;
        }
        return true;
      }),
    );
  },

  async validateVoucher({ code, subtotal }) {
    await delay(320);
    const normalized = String(code || '').trim().toUpperCase();
    const voucher = read().find((item) => item.code.toUpperCase() === normalized);

    if (!voucher) throw new Error('Mã giảm giá không tồn tại.');
    if (voucher.status !== VOUCHER_STATUS.ACTIVE) throw new Error('Mã giảm giá đã ngừng áp dụng.');

    const now = new Date();
    if (new Date(voucher.startDate) > now) throw new Error('Mã giảm giá chưa đến thời gian sử dụng.');
    if (new Date(voucher.endDate) < now) throw new Error('Mã giảm giá đã hết hạn.');
    if (Number(voucher.used) >= Number(voucher.quantity)) throw new Error('Mã giảm giá đã hết lượt sử dụng.');
    if (Number(subtotal) < Number(voucher.minOrder)) {
      throw new Error(
        `Đơn hàng tối thiểu ${Number(voucher.minOrder).toLocaleString('vi-VN')}₫ để dùng mã này.`,
      );
    }

    let discount =
      voucher.type === VOUCHER_TYPE.PERCENT
        ? (Number(subtotal) * Number(voucher.value)) / 100
        : Number(voucher.value);

    if (voucher.maxDiscount) discount = Math.min(discount, Number(voucher.maxDiscount));
    discount = Math.min(discount, Number(subtotal));

    return {
      voucher: deepClone(voucher),
      discount: Math.round(discount),
    };
  },

  async createVoucher(data) {
    await delay(320);
    const vouchers = read();
    const code = data.code.trim().toUpperCase();
    if (vouchers.some((item) => item.code.toUpperCase() === code)) {
      throw new Error('Mã giảm giá này đã tồn tại.');
    }
    const voucher = {
      id: nextId(vouchers),
      code,
      name: data.name,
      description: data.description || '',
      type: data.type,
      value: Number(data.value) || 0,
      minOrder: Number(data.minOrder) || 0,
      maxDiscount: Number(data.maxDiscount) || 0,
      quantity: Number(data.quantity) || 0,
      used: 0,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      status: data.status || VOUCHER_STATUS.ACTIVE,
    };
    writeCollection(STORAGE_KEYS.VOUCHERS, [voucher, ...vouchers]);
    return deepClone(voucher);
  },

  async updateVoucher(id, data) {
    await delay(320);
    const vouchers = read();
    const index = vouchers.findIndex((item) => String(item.id) === String(id));
    if (index === -1) throw new Error('Không tìm thấy mã giảm giá.');
    vouchers[index] = {
      ...vouchers[index],
      ...data,
      code: data.code ? data.code.trim().toUpperCase() : vouchers[index].code,
      value: data.value !== undefined ? Number(data.value) : vouchers[index].value,
      minOrder: data.minOrder !== undefined ? Number(data.minOrder) : vouchers[index].minOrder,
      maxDiscount:
        data.maxDiscount !== undefined ? Number(data.maxDiscount) : vouchers[index].maxDiscount,
      quantity: data.quantity !== undefined ? Number(data.quantity) : vouchers[index].quantity,
    };
    writeCollection(STORAGE_KEYS.VOUCHERS, vouchers);
    return deepClone(vouchers[index]);
  },

  async deleteVoucher(id) {
    await delay(280);
    const vouchers = read();
    writeCollection(
      STORAGE_KEYS.VOUCHERS,
      vouchers.filter((item) => String(item.id) !== String(id)),
    );
    return true;
  },
};
