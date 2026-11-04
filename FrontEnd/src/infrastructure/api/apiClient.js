import axios from 'axios';
import { environment } from '../config/environment';
import { attachInterceptors } from './interceptors';

export const apiClient = attachInterceptors(
  axios.create({
    baseURL: environment.apiBaseUrl,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }),
);

/**
 * Convenience wrapper: always resolves with `data`, never leaks axios shape
 * into services/repositories.
 */
export async function request(config) {
  try {
    const response = await apiClient.request(config);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message;
    if (message) {
      throw new Error(message);
    }
    throw error;
  }
}

export default apiClient;
