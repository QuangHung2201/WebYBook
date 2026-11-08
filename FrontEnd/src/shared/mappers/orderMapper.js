function pick(value, ...keys) {
  for (const key of keys) {
    if (value?.[key] !== undefined && value?.[key] !== null) return value[key];
  }
  return undefined;
}

export function mapOrderItemFromApi(dto) {
  return {
    bookId: pick(dto, 'bookId', 'book_id', 'productId') ?? null,
    title: pick(dto, 'title', 'bookTitle', 'book_title', 'name') || '',
    coverImage: pick(dto, 'coverImage', 'cover_image') || '',
    price: Number(pick(dto, 'price', 'unitPrice', 'unit_price')) || 0,
    qty: Number(pick(dto, 'qty', 'quantity')) || 1,
  };
}

function mapStatus(value) {
  return value ? String(value).toUpperCase() : null;
}

export function mapOrderHistoryFromApi(dto) {
  return {
    id: pick(dto, 'id'),
    oldStatus: mapStatus(pick(dto, 'oldStatus', 'old_status')),
    newStatus: mapStatus(pick(dto, 'newStatus', 'new_status')) || '',
    note: pick(dto, 'note') || '',
    changedByName: pick(dto, 'changedByName', 'changed_by_name') || '',
    createdAt: pick(dto, 'createdAt', 'created_at') || null,
  };
}

export function mapOrderFromApi(dto, { preserveMissingPayment = false } = {}) {
  if (!dto) return null;
  return {
    id: pick(dto, 'id'),
    code: pick(dto, 'code', 'orderCode', 'order_code') || '',
    userId: pick(dto, 'userId', 'user_id') ?? null,
    customerName: pick(dto, 'customerName', 'customer_name') || '',
    phone: pick(dto, 'phone') || '',
    address: pick(dto, 'address', 'shippingAddress', 'shipping_address') || '',
    items: (pick(dto, 'items', 'orderItems', 'order_items') || []).map(mapOrderItemFromApi),
    subtotal: Number(pick(dto, 'subtotal', 'subTotal')) || 0,
    shippingFee: Number(pick(dto, 'shippingFee', 'shipping_fee')) || 0,
    discount: Number(pick(dto, 'discount', 'discountAmount', 'discount_amount')) || 0,
    total: Number(pick(dto, 'total', 'totalAmount', 'total_amount')) || 0,
    status: String(pick(dto, 'status') || 'pending').toUpperCase(),
    paymentMethod: pick(dto, 'paymentMethod', 'payment_method') || (preserveMissingPayment ? '' : 'COD'),
    paymentStatus: pick(dto, 'paymentStatus', 'payment_status') || '',
    shippingMethod: pick(dto, 'shippingMethod', 'shipping_method') || (preserveMissingPayment ? '' : 'STANDARD'),
    voucherCode: pick(dto, 'voucherCode', 'voucher_code') || '',
    note: pick(dto, 'note') || '',
    history: (pick(dto, 'history', 'statusHistory', 'status_history') || []).map(
      mapOrderHistoryFromApi,
    ),
    createdAt: pick(dto, 'createdAt', 'created_at') || null,
    updatedAt: pick(dto, 'updatedAt', 'updated_at') || null,
  };
}

export function mapOrderToApi(model) {
  return {
    customerName: model.customerName,
    phone: model.phone,
    address: model.address,
    note: model.note || '',
    paymentMethod: model.paymentMethod,
    shippingMethod: model.shippingMethod,
    voucherCode: model.voucherCode || '',
    items: (model.items || []).map((item) => ({
      bookId: item.bookId,
      qty: item.qty,
    })),
  };
}

export function mapOrderPageFromApi(payload, options) {
  const source = payload?.data ?? payload ?? {};
  const items = Array.isArray(source) ? source : source.items ?? source.content ?? [];
  const total = Array.isArray(source) ? items.length : source.total ?? source.totalElements ?? items.length;
  return {
    items: items.map((item) => mapOrderFromApi(item, options)),
    total,
    page: source.page ?? (source.number !== undefined ? source.number + 1 : 1),
    pageSize: source.pageSize ?? source.size ?? items.length,
    totalPages: source.totalPages ?? Math.max(1, Math.ceil(total / (source.pageSize || items.length || 1))),
  };
}
