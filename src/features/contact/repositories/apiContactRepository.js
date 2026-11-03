import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';

export const apiContactRepository = {
  async sendContact(data) {
    const payload = await request({
      url: API_ENDPOINTS.contacts.send,
      method: 'POST',
      data,
    });
    return payload?.data ?? payload;
  },
};
