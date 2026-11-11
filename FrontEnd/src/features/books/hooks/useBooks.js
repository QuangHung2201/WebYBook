import { useCallback, useEffect, useState } from 'react';
import { bookService } from '../services/bookService';

const DEFAULT_PARAMS = {
  page: 1,
  pageSize: 12,
  sort: 'newest',
  keyword: '',
  categoryId: '',
  authorId: '',
  publisherId: '',
  minPrice: '',
  maxPrice: '',
  minRating: '',
};

export function useBooks(initialParams = {}) {
  const [params, setParams] = useState({ ...DEFAULT_PARAMS, ...initialParams });
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    bookService
      .getStoreBooks(params)
      .then((result) => {
        if (!active) return;
        setData(result);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Không thể tải danh sách sách.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params, reloadKey]);

  const updateParams = useCallback((patch) => {
    setParams((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setParams((current) => ({ ...current, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const searchBooks = useCallback((keyword) => updateParams({ keyword }), [updateParams]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  return {
    books: data.items,
    total: data.total,
    page: data.page,
    totalPages: data.totalPages,
    pageSize: params.pageSize,
    params,
    loading,
    error,
    updateParams,
    setPage,
    searchBooks,
    refresh,
  };
}
