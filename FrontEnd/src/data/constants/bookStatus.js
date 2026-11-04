export const BOOK_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const BOOK_STATUS_LABELS = {
  [BOOK_STATUS.ACTIVE]: 'Đang bán',
  [BOOK_STATUS.INACTIVE]: 'Ngừng bán',
};

export const BOOK_STATUS_OPTIONS = Object.values(BOOK_STATUS).map((value) => ({
  value,
  label: BOOK_STATUS_LABELS[value],
}));

export const BOOK_SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'bestseller', label: 'Bán chạy' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao' },
];
