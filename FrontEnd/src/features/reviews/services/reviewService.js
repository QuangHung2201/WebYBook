import { reviewRepository } from '../repositories/reviewRepository';

export const reviewService = {
  getReviewsByBook: (bookId) => reviewRepository.getByBook(bookId),
  getMyReview: (bookId, userId) => reviewRepository.getMine(bookId, userId),
  createReview: (bookId, data) => reviewRepository.createReview(bookId, data),
  updateReview: (id, data) => reviewRepository.updateReview(id, data),
  removeReview: (id, userId) => reviewRepository.removeReview(id, userId),
};
