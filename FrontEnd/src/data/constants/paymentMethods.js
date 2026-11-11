export const PAYMENT_METHODS = {
  COD: 'COD',
  VNPAY: 'VNPAY',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.COD]: 'Thanh toán khi nhận hàng (COD)',
  [PAYMENT_METHODS.VNPAY]: 'Cổng thanh toán VNPAY',
};

export const PAYMENT_METHOD_OPTIONS = Object.values(PAYMENT_METHODS).map((value) => ({
  value,
  label: PAYMENT_METHOD_LABELS[value],
}));
