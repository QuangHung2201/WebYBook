import { isMockDataSource } from '@/infrastructure/config/environment';
import { mockBookRepository } from './mockBookRepository';
import { apiBookRepository } from './apiBookRepository';

export const bookRepository = isMockDataSource() ? mockBookRepository : apiBookRepository;
