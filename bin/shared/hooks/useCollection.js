import { useCallback, useEffect, useState } from 'react';

/**
 * Generic read-only collection hook used by taxonomy features.
 * `loader` must be a stable function reference (e.g. a service method).
 */
export function useCollection(loader, { autoLoad = true } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loader();
      setItems(Array.isArray(result) ? result : result?.items ?? []);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    if (autoLoad) reload();
  }, [autoLoad, reload]);

  return { items, loading, error, reload, setItems };
}
