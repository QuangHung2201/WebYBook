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

export function mapOrderFromApi(dto) {
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
    status: pick(dto, 'status') || 'PENDING',
    paymentMethod: pick(dto, 'paymentMethod', 'payment_method') || 'COD',
    shippingMethod: pick(dto, 'shippingMethod', 'shipping_method') || 'STANDARD',
    voucherCode: pick(dto, 'voucherCode', 'voucher_code') || '',
    note: pick(dto, 'note') || '',
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

export function mapOrderPageFromApi(payload) {
  const source = payload?.data ?? payload ?? {};
  const items = Array.isArray(source) ? source : source.items ?? source.content ?? [];
  const total = Array.isArray(source) ? items.length : source.total ?? source.totalElements ?? items.length;
  return {
    items: items.map(mapOrderFromApi),
    total,
    page: source.page ?? source.number ?? 1,
    pageSize: source.pageSize ?? source.size ?? items.length,
    totalPages: source.totalPages ?? Math.max(1, Math.ceil(total / (source.pageSize || items.length || 1))),
  };
}
