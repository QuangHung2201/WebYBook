export const VOUCHER_TYPE = {
  PERCENT: 'PERCENT',
  FIXED: 'FIXED',
};

export const VOUCHER_TYPE_LABELS = {
  [VOUCHER_TYPE.PERCENT]: 'Giảm theo %',
  [VOUCHER_TYPE.FIXED]: 'Giảm số tiền',
};

export const VOUCHER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const VOUCHER_STATUS_LABELS = {
  [VOUCHER_STATUS.ACTIVE]: 'Đang áp dụng',
  [VOUCHER_STATUS.INACTIVE]: 'Tạm dừng',
};

export const VOUCHER_TYPE_OPTIONS = Object.values(VOUCHER_TYPE).map((value) => ({
  value,
  label: VOUCHER_TYPE_LABELS[value],
}));

export const VOUCHER_STATUS_OPTIONS = Object.values(VOUCHER_STATUS).map((value) => ({
  value,
  label: VOUCHER_STATUS_LABELS[value],
}));
