import {
  deepClone,
  delay,
  nextId,
  readCollection,
  writeCollection,
} from '@/infrastructure/storage/mockCollection';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';
import { ordersMock } from '@/data/mock/orders.mock';
import { ORDER_STATUS, CANCELLABLE_STATUSES } from '@/data/constants/orderStatus';
import { normalizeKeyword } from '@/shared/utils/validators';

const read = () => readCollection(STORAGE_KEYS.ORDERS, ordersMock);

function paginate(items, page, pageSize) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: deepClone(items.slice(start, start + pageSize)),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export const mockOrderRepository = {
  async getOrders(params = {}) {
    await delay(260);
    const { userId = null, status = null, keyword = '', page = 1, pageSize = 10 } = params;

    let items = read();

    if (userId !== null && userId !== undefined && userId !== '') {
      items = items.filter((order) => String(order.userId) === String(userId));
    }
    if (status) items = items.filter((order) => order.status === status);
    if (keyword) {
      const needle = normalizeKeyword(keyword);
      items = items.filter((order) =>
        [order.code, order.customerName, order.phone]
          .map(normalizeKeyword)
          .some((value) => value.includes(needle)),
      );
    }

    items = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return paginate(items, Number(page) || 1, Number(pageSize) || 10);
  },

  async getOrderById(id, userId = null) {
    await delay(200);
    const order = read().find((item) => String(item.id) === String(id));
    if (!order) throw new Error('Không tìm thấy đơn hàng.');
    if (userId !== null && userId !== undefined && String(order.userId) !== String(userId)) {
      throw new Error('Bạn không có quyền xem đơn hàng này.');
    }
    return deepClone(order);
  },

  async createOrder(data) {
    await delay(450);
    const orders = read();
    const id = nextId(orders);
    const now = new Date().toISOString();

    const order = {
      id,
      code: `YB${id}`,
      userId: data.userId,
      customerName: data.customerName,
      phone: data.phone,
      address: data.address,
      items: data.items,
      subtotal: Number(data.subtotal) || 0,
      shippingFee: Number(data.shippingFee) || 0,
      discount: Number(data.discount) || 0,
      total: Number(data.total) || 0,
      status: ORDER_STATUS.PENDING,
      paymentMethod: data.paymentMethod || 'COD',
      shippingMethod: data.shippingMethod || 'STANDARD',
      voucherCode: data.voucherCode || '',
      note: data.note || '',
      createdAt: now,
      updatedAt: now,
    };

    writeCollection(STORAGE_KEYS.ORDERS, [order, ...orders]);
    return deepClone(order);
  },

  async updateStatus(id, status) {
    await delay(260);
    const orders = read();
    const index = orders.findIndex((item) => String(item.id) === String(id));
    if (index === -1) throw new Error('Không tìm thấy đơn hàng.');
    orders[index] = { ...orders[index], status, updatedAt: new Date().toISOString() };
    writeCollection(STORAGE_KEYS.ORDERS, orders);
    return deepClone(orders[index]);
  },

  async cancelOrder(id, userId) {
    await delay(320);
    const orders = read();
    const index = orders.findIndex((item) => String(item.id) === String(id));
    if (index === -1) throw new Error('Không tìm thấy đơn hàng.');
    if (userId !== null && userId !== undefined && String(orders[index].userId) !== String(userId)) {
      throw new Error('Bạn không có quyền hủy đơn hàng này.');
    }
    if (!CANCELLABLE_STATUSES.includes(orders[index].status)) {
      throw new Error('Đơn hàng ở trạng thái này không thể hủy.');
    }
    orders[index] = {
      ...orders[index],
      status: ORDER_STATUS.CANCELLED,
      updatedAt: new Date().toISOString(),
    };
    writeCollection(STORAGE_KEYS.ORDERS, orders);
    return deepClone(orders[index]);
  },
};
