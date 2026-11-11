import { wishlistRepository } from '../repositories/wishlistRepository';

export const wishlistService = {
  getWishlist: (userId) => wishlistRepository.getWishlist(userId),
  add: (userId, bookId) => wishlistRepository.add(userId, bookId),
  remove: (userId, bookId) => wishlistRepository.remove(userId, bookId),
};
