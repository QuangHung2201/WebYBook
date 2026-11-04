import { useCallback, useEffect, useState } from 'react';
import { orderService } from '../services/orderService';

const DEFAULTS = { page: 1, pageSize: 10, status: '', keyword: '', userId: null };

export function useOrders(initialParams = {}) {
  const [params, setParams] = useState({ ...DEFAULTS, ...initialParams });
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    orderService
      .getOrders(params)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Không thể tải danh sách đơn hàng.');
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
  }, []);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  return {
    orders: data.items,
    total: data.total,
    page: data.page,
    totalPages: data.totalPages,
    params,
    loading,
    error,
    updateParams,
    setPage,
    refresh,
  };
}
