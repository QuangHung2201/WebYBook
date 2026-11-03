export function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '0₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(value) {
  const amount = Number(value) || 0;
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} triệu`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)} nghìn`;
  return formatCurrency(amount);
}

export function calcDiscountPercent(price, discountPrice) {
  if (!price || !discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}
