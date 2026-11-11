export const ORDER_STATUS = {
  PENDING: 'PENDING',
  DELIVERED: 'DELIVERED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
  [ORDER_STATUS.DELIVERED]: 'Đã giao',
  [ORDER_STATUS.REJECTED]: 'Bị từ chối',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
  [ORDER_STATUS.RETURNED]: 'Đã hoàn trả',
};

export const ORDER_STATUS_TONES = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.DELIVERED]: 'success',
  [ORDER_STATUS.REJECTED]: 'danger',
  [ORDER_STATUS.CANCELLED]: 'danger',
  [ORDER_STATUS.RETURNED]: 'warning',
};

export const ORDER_STATUS_OPTIONS = Object.values(ORDER_STATUS).map((value) => ({
  value,
  label: ORDER_STATUS_LABELS[value],
}));

export const CANCELLABLE_STATUSES = [ORDER_STATUS.PENDING];
