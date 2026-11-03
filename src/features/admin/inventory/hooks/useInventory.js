import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/app/providers/ToastProvider';
import { bookService } from '@/features/books/services/bookService';

export function useInventory() {
  const toast = useToast();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    bookService
      .getBooks({ page: 1, pageSize: 1000, sort: 'newest' })
      .then((result) => {
        if (active) setBooks(result.items);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Không thể tải dữ liệu tồn kho.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  const setStock = useCallback(
    async (book, nextValue) => {
      const current = Number(book.stock) || 0;
      const next = Math.max(0, Math.floor(Number(nextValue) || 0));
      if (next === current) return;

      setBooks((items) =>
        items.map((item) =>
          String(item.id) === String(book.id) ? { ...item, stock: next } : item,
        ),
      );
      setUpdatingId(book.id);

      try {
        await bookService.updateStock(book.id, next - current);
      } catch (err) {
        setBooks((items) =>
          items.map((item) =>
            String(item.id) === String(book.id) ? { ...item, stock: current } : item,
          ),
        );
        toast.error(err.message || 'Không thể cập nhật tồn kho.');
      } finally {
        setUpdatingId(null);
      }
    },
    [toast],
  );

  return { books, loading, error, updatingId, refresh, setStock };
}
