/**
 * Thin adapter around localStorage so the rest of the app never touches it
 * directly. Mock repositories are the only consumers.
 */
export const localStorageAdapter = {
  get(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      console.warn(`[storage] Không đọc được "${key}"`, error);
      return fallback;
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`[storage] Không ghi được "${key}"`, error);
      return false;
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[storage] Không xóa được "${key}"`, error);
    }
  },

  clear() {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.warn('[storage] Không xóa được localStorage', error);
    }
  },
};
