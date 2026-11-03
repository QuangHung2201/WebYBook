import { useCallback, useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const overview = await dashboardService.getOverview();
      setData(overview);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu tổng quan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
