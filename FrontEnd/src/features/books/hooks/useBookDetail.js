import { useCallback, useEffect, useState } from 'react';
import { bookService } from '../services/bookService';

export function useBookDetail(id) {
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return undefined;
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([bookService.getStoreBookById(id), bookService.getRelatedBooks(id, 4)])
      .then(([detail, related]) => {
        if (!active) return;
        setBook(detail);
        setRelatedBooks(related);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Không thể tải thông tin sách.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  return { book, relatedBooks, loading, error, refresh };
}
