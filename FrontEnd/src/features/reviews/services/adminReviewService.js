import { adminReviewRepository } from '../repositories/adminReviewRepository';

export const adminReviewService = {
  list: (params) => adminReviewRepository.list(params),
  updateStatus: (id, status) => adminReviewRepository.updateStatus(id, status),
  remove: (id) => adminReviewRepository.remove(id),
};
