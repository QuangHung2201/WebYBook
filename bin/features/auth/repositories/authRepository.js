import { isMockDataSource } from '@/infrastructure/config/environment';
import { mockAuthRepository } from './mockAuthRepository';
import { apiAuthRepository } from './apiAuthRepository';

/** The only place that decides which auth data source is active. */
export const authRepository = isMockDataSource() ? mockAuthRepository : apiAuthRepository;
