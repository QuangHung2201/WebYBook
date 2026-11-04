import { STORAGE_KEYS } from '../storage/storageKeys';
import { localStorageAdapter } from '../storage/localStorageAdapter';

/**
 * Registers request/response interceptors on the axios instance.
 * Kept separate from apiClient so the transport setup stays declarative.
 */
export function attachInterceptors(instance) {
  instance.interceptors.request.use((config) => {
    const token = localStorageAdapter.get(STORAGE_KEYS.AUTH_TOKEN, null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Client'] = 'webybook-web';
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error),
  );

  return instance;
}
