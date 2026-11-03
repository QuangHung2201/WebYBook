import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';
import { mapUserFromApi, mapUserToApi } from '@/shared/mappers/userMapper';

const unwrapList = (payload) => {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data : data.items ?? data.content ?? [];
};

export const apiUserRepository = {
  async getProfile() {
    const payload = await request({ url: API_ENDPOINTS.users.me });
    return mapUserFromApi(payload?.data ?? payload);
  },
  async updateProfile(userId, data) {
    const payload = await request({
      url: API_ENDPOINTS.users.updateMe,
      method: 'PUT',
      data: mapUserToApi(data),
    });
    return mapUserFromApi(payload?.data ?? payload);
  },
  async changePassword(userId, data) {
    await request({
      url: API_ENDPOINTS.users.changePassword,
      method: 'PATCH',
      data,
    });
    return true;
  },
  async getUsers() {
    const payload = await request({ url: API_ENDPOINTS.users.list });
    return unwrapList(payload).map(mapUserFromApi);
  },
  async updateRole(userId, role) {
    const payload = await request({
      url: API_ENDPOINTS.users.updateRole(userId),
      method: 'PATCH',
      data: { role },
    });
    return mapUserFromApi(payload?.data ?? payload);
  },
  async updateStatus(userId, status) {
    const payload = await request({
      url: API_ENDPOINTS.users.updateStatus(userId),
      method: 'PATCH',
      data: { status },
    });
    return mapUserFromApi(payload?.data ?? payload);
  },
};
