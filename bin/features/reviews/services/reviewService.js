import { reviewRepository } from '../repositories/reviewRepository';

export const reviewService = {
  getReviewsByBook: (bookId) => reviewRepository.getByBook(bookId),
  createReview: (bookId, data) => reviewRepository.createReview(bookId, data),
  removeReview: (id, userId) => reviewRepository.removeReview(id, userId),
};
