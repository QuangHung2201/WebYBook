import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';
import { mapUserFromApi, mapUserToApi } from '@/shared/mappers/userMapper';

const unwrapList = (payload) => {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data : data.items ?? data.content ?? [];
};

export const apiUserRepository = {
  async getProfile() {
    const payload = await request({ url: API_ENDPOINTS.auth.me });
    return mapUserFromApi(payload?.data ?? payload);
  },
  async updateProfile(userId, data) {
    const payload = await request({
      url: API_ENDPOINTS.auth.me,
      method: 'PUT',
      data: mapUserToApi(data),
    });
    return mapUserFromApi(payload?.data ?? payload);
  },
  async changePassword(userId, data) {
    await request({
      url: `${API_ENDPOINTS.auth.me}/password`,
      method: 'PATCH',
      data,
    });
    return true;
  },
  async getUsers() {
    const payload = await request({ url: API_ENDPOINTS.admin.users.list });
    return unwrapList(payload).map(mapUserFromApi);
  },
  async updateRole(userId, role) {
    const current = await request({ url: API_ENDPOINTS.admin.users.detail(userId) });
    const user = mapUserFromApi(current?.data ?? current);
    const payload = await request({
      url: API_ENDPOINTS.admin.users.update(userId),
      method: 'PUT',
      data: { fullName: user.fullName, phone: user.phone || '', role, status: user.status },
    });
    return mapUserFromApi(payload?.data ?? payload);
  },
  async updateStatus(userId, status) {
    const current = await request({ url: API_ENDPOINTS.admin.users.detail(userId) });
    const user = mapUserFromApi(current?.data ?? current);
    const payload = await request({
      url: API_ENDPOINTS.admin.users.update(userId),
      method: 'PUT',
      data: { fullName: user.fullName, phone: user.phone || '', role: user.role, status },
    });
    return mapUserFromApi(payload?.data ?? payload);
  },
};
