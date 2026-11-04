import { isMockDataSource } from '@/infrastructure/config/environment';
import { mockVoucherRepository } from './mockVoucherRepository';
import { apiVoucherRepository } from './apiVoucherRepository';

export const voucherRepository = isMockDataSource()
  ? mockVoucherRepository
  : apiVoucherRepository;
