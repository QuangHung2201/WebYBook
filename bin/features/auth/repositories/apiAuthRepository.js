import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';
import { mapAuthPayloadFromApi, mapUserFromApi } from '@/shared/mappers/userMapper';

export const apiAuthRepository = {
  async login(credentials) {
    const payload = await request({
      url: API_ENDPOINTS.auth.login,
      method: 'POST',
      data: credentials,
    });
    return mapAuthPayloadFromApi(payload);
  },

  async register(data) {
    const payload = await request({
      url: API_ENDPOINTS.auth.register,
      method: 'POST',
      data,
    });
    return mapAuthPayloadFromApi(payload);
  },

  async forgotPassword(data) {
    const payload = await request({
      url: API_ENDPOINTS.auth.forgotPassword,
      method: 'POST',
      data,
    });
    return payload?.data ?? payload;
  },

  async getMe() {
    const payload = await request({ url: API_ENDPOINTS.auth.me });
    return mapUserFromApi(payload?.data ?? payload);
  },

  async logout() {
    try {
      await request({ url: API_ENDPOINTS.auth.logout, method: 'POST' });
    } catch {
      // Logout locally even if the backend call fails.
    }
    return true;
  },
};
