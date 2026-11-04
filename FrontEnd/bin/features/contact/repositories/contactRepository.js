import { isMockDataSource } from '@/infrastructure/config/environment';
import { mockContactRepository } from './mockContactRepository';
import { apiContactRepository } from './apiContactRepository';

export const contactRepository = isMockDataSource()
  ? mockContactRepository
  : apiContactRepository;
