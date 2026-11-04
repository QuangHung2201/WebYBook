export const SHIPPING_METHODS = {
  STANDARD: 'STANDARD',
  EXPRESS: 'EXPRESS',
};

export const SHIPPING_METHODS_LIST = [
  {
    value: SHIPPING_METHODS.STANDARD,
    label: 'Giao hàng tiêu chuẩn',
    description: 'Nhận hàng trong 3 - 5 ngày làm việc',
    fee: 30000,
  },
  {
    value: SHIPPING_METHODS.EXPRESS,
    label: 'Giao hàng nhanh',
    description: 'Nhận hàng trong 1 - 2 ngày làm việc',
    fee: 60000,
  },
];

export const FREE_SHIPPING_THRESHOLD = 500000;

export function getShippingFee(method, subtotal) {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  const found = SHIPPING_METHODS_LIST.find((item) => item.value === method);
  return found ? found.fee : 0;
}
