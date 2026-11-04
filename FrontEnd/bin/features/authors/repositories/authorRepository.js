import { isMockDataSource } from '@/infrastructure/config/environment';
import { mockAuthorRepository } from './mockAuthorRepository';
import { apiAuthorRepository } from './apiAuthorRepository';

export const authorRepository = isMockDataSource() ? mockAuthorRepository : apiAuthorRepository;
