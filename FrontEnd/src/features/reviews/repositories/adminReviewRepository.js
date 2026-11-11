import { isMockDataSource } from '@/infrastructure/config/environment';
import { apiAdminReviewRepository } from './apiAdminReviewRepository';

const mockAdminReviewRepository = {
  async list() {
    return [];
  },
  async updateStatus() {
    return null;
  },
  async remove() {
    return true;
  },
};

export const adminReviewRepository = isMockDataSource()
  ? mockAdminReviewRepository
  : apiAdminReviewRepository;
