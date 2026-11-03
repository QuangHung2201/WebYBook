export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^(0|\+84)(\d{9,10})$/;

export function isValidEmail(value) {
  return EMAIL_REGEX.test(String(value || '').trim());
}

export function isValidPhone(value) {
  return PHONE_REGEX.test(String(value || '').replace(/\s|-/g, ''));
}

export function normalizeKeyword(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

export function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
