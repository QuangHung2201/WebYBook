import { isMockDataSource } from '@/infrastructure/config/environment';
import { mockWishlistRepository } from './mockWishlistRepository';
import { apiWishlistRepository } from './apiWishlistRepository';

export const wishlistRepository = isMockDataSource()
  ? mockWishlistRepository
  : apiWishlistRepository;
