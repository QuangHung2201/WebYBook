import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/app/providers/ToastProvider';
import { reviewService } from '../services/reviewService';

export function useReviews(bookId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const toast = useToast();

  useEffect(() => {
    if (!bookId) return undefined;
    let active = true;
    setLoading(true);
    setError(null);

    reviewService
      .getReviewsByBook(bookId)
      .then((result) => {
        if (active) setReviews(result);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Không thể tải đánh giá.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bookId, reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  const submitReview = async (user, data) => {
    setSubmitting(true);
    try {
      await reviewService.createReview(bookId, {
        userId: user.id,
        userName: user.fullName || user.username,
        rating: data.rating,
        comment: data.comment,
      });
      toast.success('Cảm ơn bạn đã gửi đánh giá!');
      refresh();
      return true;
    } catch (err) {
      toast.error(err.message || 'Không thể gửi đánh giá.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const removeReview = async (user, id) => {
    try {
      await reviewService.removeReview(id, user?.id);
      toast.success('Đã xóa đánh giá.');
      refresh();
      return true;
    } catch (err) {
      toast.error(err.message || 'Không thể xóa đánh giá.');
      return false;
    }
  };

  return { reviews, loading, error, submitting, submitReview, removeReview, refresh };
}
