import { isMockDataSource } from '@/infrastructure/config/environment';
import { mockCategoryRepository } from './mockCategoryRepository';
import { apiCategoryRepository } from './apiCategoryRepository';

export const categoryRepository = isMockDataSource()
  ? mockCategoryRepository
  : apiCategoryRepository;
