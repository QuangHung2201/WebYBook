import { isMockDataSource } from '@/infrastructure/config/environment';
import { mockReviewRepository } from './mockReviewRepository';
import { apiReviewRepository } from './apiReviewRepository';

export const reviewRepository = isMockDataSource() ? mockReviewRepository : apiReviewRepository;
