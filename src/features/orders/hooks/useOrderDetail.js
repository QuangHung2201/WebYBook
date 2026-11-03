import { useCallback, useEffect, useState } from 'react';
import { orderService } from '../services/orderService';

export function useOrderDetail(id, userId = null) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return undefined;
    let active = true;
    setLoading(true);
    setError(null);

    orderService
      .getOrderById(id, userId)
      .then((result) => {
        if (active) setOrder(result);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Không thể tải đơn hàng.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, userId, reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  return { order, loading, error, refresh, setOrder };
}
