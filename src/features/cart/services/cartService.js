import { cartRepository } from '../repositories/cartRepository';

export const cartService = {
  getCart: () => cartRepository.getCart(),
  addItem: (bookId, qty = 1) => cartRepository.addItem(bookId, qty),
  updateItem: (bookId, qty) => cartRepository.updateItem(bookId, qty),
  removeItem: (bookId) => cartRepository.removeItem(bookId),
  clear: () => cartRepository.clear(),
};
