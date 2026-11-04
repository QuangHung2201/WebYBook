import { localStorageAdapter } from './localStorageAdapter';

export function deepClone(value) {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

export function delay(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Reads a collection from localStorage, seeding it on first use.
 */
export function readCollection(key, seed = []) {
  const existing = localStorageAdapter.get(key, null);
  if (existing === null) {
    localStorageAdapter.set(key, seed);
    return deepClone(seed);
  }
  return existing;
}

export function writeCollection(key, value) {
  localStorageAdapter.set(key, value);
  return value;
}

export function resetCollection(key, seed = []) {
  const copy = deepClone(seed);
  localStorageAdapter.set(key, copy);
  return copy;
}

export function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}
