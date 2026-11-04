import { isMockDataSource } from '@/infrastructure/config/environment';
import { mockCartRepository } from './mockCartRepository';
import { apiCartRepository } from './apiCartRepository';

export const cartRepository = isMockDataSource() ? mockCartRepository : apiCartRepository;
