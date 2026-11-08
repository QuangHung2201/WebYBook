import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/app/providers/ToastProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { reviewService } from '../services/reviewService';

export function useReviews(bookId) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const submitLock = useRef(false);
  const toast = useToast();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!bookId) return undefined;
    let active = true;
    setLoading(true);
    setError(null);

    Promise.resolve()
      .then(() => Promise.all([
        reviewService.getReviewsByBook(bookId),
        userId
          ? reviewService.getMyReview(bookId, userId).catch(() => null)
          : Promise.resolve(null),
      ]))
      .then(([list, mine]) => {
        if (!active) return;
        setReviews(list);
        setMyReview(userId ? mine ?? null : null);
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
  }, [bookId, userId, reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  const submitReview = async (currentUser, data) => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để gửi đánh giá.');
      return false;
    }
    if (submitLock.current) return false;
    submitLock.current = true;
    setSubmitting(true);
    try {
      const payload = {
        userId: currentUser.id,
        userName: currentUser.fullName || currentUser.username,
        rating: data.rating,
        comment: String(data.comment || '').trim(),
      };
      if (myReview?.id) {
        await reviewService.updateReview(myReview.id, payload);
        toast.success('Đã cập nhật đánh giá. Đánh giá sẽ hiển thị sau khi được duyệt.');
      } else {
        await reviewService.createReview(bookId, payload);
        toast.success('Cảm ơn bạn đã gửi đánh giá! Đánh giá sẽ hiển thị sau khi được duyệt.');
      }
      refresh();
      return true;
    } catch (err) {
      toast.error(err.message || 'Không thể gửi đánh giá.');
      return false;
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const removeReview = async (currentUser, id) => {
    try {
      await reviewService.removeReview(id, currentUser?.id);
      setMyReview((current) => (String(current?.id) === String(id) ? null : current));
      toast.success('Đã xóa đánh giá.');
      refresh();
      return true;
    } catch (err) {
      toast.error(err.message || 'Không thể xóa đánh giá.');
      return false;
    }
  };

  return {
    reviews,
    myReview,
    loading,
    error,
    submitting,
    submitReview,
    removeReview,
    refresh,
  };
}
