import { isMockDataSource } from '@/infrastructure/config/environment';
import { mockOrderRepository } from './mockOrderRepository';
import { apiOrderRepository } from './apiOrderRepository';

export const orderRepository = isMockDataSource() ? mockOrderRepository : apiOrderRepository;
