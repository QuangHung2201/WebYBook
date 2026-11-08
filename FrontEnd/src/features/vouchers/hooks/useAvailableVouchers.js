import { useCallback, useEffect, useState } from 'react';
import { voucherService } from '../services/voucherService';

export function useAvailableVouchers(subtotal = '', includeUnavailable = false) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await voucherService.getAvailableVouchers(subtotal, includeUnavailable);
      setVouchers(result);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách voucher.');
    } finally {
      setLoading(false);
    }
  }, [subtotal, includeUnavailable]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { vouchers, loading, error, reload };
}
