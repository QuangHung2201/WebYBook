import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/app/providers/ToastProvider';
import { orderService } from '@/features/orders/services/orderService';

const DEFAULT_PARAMS = { page: 1, pageSize: 10, keyword: '', status: '' };

export function useAdminOrders() {
  const toast = useToast();
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const updateStatus = useCallback(
    async (id, status) => {
      setSaving(true);
      try {
        await orderService.updateStatus(id, status);
        toast.success('Đã cập nhật trạng thái đơn hàng.');
        refresh();
        return true;
      } catch (err) {
        toast.error(err.message || 'Không thể cập nhật trạng thái đơn hàng.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [refresh, toast],
  );

  const confirmPayment = useCallback(
    async (id) => {
      setSaving(true);
      try {
        await orderService.confirmPayment(id);
        toast.success('Đã xác nhận thu tiền COD.');
        refresh();
        return true;
      } catch (err) {
        toast.error(err.message || 'Không thể xác nhận thanh toán.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [refresh, toast],
  );

  return {
    orders: data.items,
    total: data.total,
    page: data.page,
    totalPages: data.totalPages,
    params,
    loading,
    saving,
    error,
    updateParams,
    setPage,
    refresh,
    updateStatus,
    confirmPayment,
  };
}
