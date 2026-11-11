import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/app/providers/ToastProvider';
import { wishlistService } from '../services/wishlistService';

export function useWishlist() {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?.id ?? null;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState(null);
  const [pendingIds, setPendingIds] = useState([]);

  const reload = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      setError(null);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const result = await wishlistService.getWishlist(userId);
      setItems(result);
      return result;
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách yêu thích.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const wishlistIds = useMemo(
    () => new Set(items.map((item) => String(item.id))),
    [items],
  );

  const isWishlisted = useCallback(
    (bookId) => wishlistIds.has(String(bookId)),
    [wishlistIds],
  );

  const isPending = useCallback(
    (bookId) => pendingIds.some((id) => String(id) === String(bookId)),
    [pendingIds],
  );

  const addToWishlist = useCallback(
    async (book) => {
      if (!userId) {
        toast.error('Vui lòng đăng nhập để lưu sách yêu thích.');
        return false;
      }
      if (!book?.id) return false;
      setPendingIds((current) => [...current, book.id]);
      try {
        await wishlistService.add(userId, book.id);
        setItems((current) =>
          current.some((item) => String(item.id) === String(book.id))
            ? current
            : [book, ...current],
        );
        toast.success('Đã thêm sách vào danh sách yêu thích.');
        return true;
      } catch (err) {
        toast.error(err.message || 'Không thể thêm vào danh sách yêu thích.');
        return false;
      } finally {
        setPendingIds((current) =>
          current.filter((id) => String(id) !== String(book.id)),
        );
      }
    },
    [toast, userId],
  );

  const removeFromWishlist = useCallback(
    async (bookId) => {
      if (!userId) return false;
      setPendingIds((current) => [...current, bookId]);
      try {
        await wishlistService.remove(userId, bookId);
        setItems((current) => current.filter((item) => String(item.id) !== String(bookId)));
        toast.success('Đã xóa sách khỏi danh sách yêu thích.');
        return true;
      } catch (err) {
        toast.error(err.message || 'Không thể xóa khỏi danh sách yêu thích.');
        return false;
      } finally {
        setPendingIds((current) =>
          current.filter((id) => String(id) !== String(bookId)),
        );
      }
    },
    [toast, userId],
  );

  const toggleWishlist = useCallback(
    async (book) => {
      if (isWishlisted(book?.id)) return removeFromWishlist(book.id);
      return addToWishlist(book);
    },
    [addToWishlist, isWishlisted, removeFromWishlist],
  );

  return {
    items,
    loading,
    error,
    isWishlisted,
    isPending,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    reload,
  };
}
