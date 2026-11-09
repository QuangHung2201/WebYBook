import { isMockAuthDataSource } from '@/infrastructure/config/environment';
import { mockAuthRepository } from './mockAuthRepository';
import { apiAuthRepository } from './apiAuthRepository';

/** The only place that decides which auth data source is active. */
export const authRepository = isMockAuthDataSource() ? mockAuthRepository : apiAuthRepository;
//Chọn API thật => gọi apiAuthRepository ( backend nhận request )