import { isMockDataSource } from '@/infrastructure/config/environment';
import { mockPublisherRepository } from './mockPublisherRepository';
import { apiPublisherRepository } from './apiPublisherRepository';

export const publisherRepository = isMockDataSource()
  ? mockPublisherRepository
  : apiPublisherRepository;
