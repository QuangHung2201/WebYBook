import { isMockDataSource } from '@/infrastructure/config/environment';
import { mockUserRepository } from './mockUserRepository';
import { apiUserRepository } from './apiUserRepository';

export const userRepository = isMockDataSource() ? mockUserRepository : apiUserRepository;
