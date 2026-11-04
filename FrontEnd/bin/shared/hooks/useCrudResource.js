import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/app/providers/ToastProvider';

/**
 * Generic CRUD orchestration for simple admin resources.
 * The page supplies stable service methods; this hook owns loading/saving/toast.
 */
export function useCrudResource({
  list,
  create,
  update,
  remove,
  messages = {},
  autoLoad = true,
}) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await list();
      setItems(Array.isArray(result) ? result : result?.items ?? []);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [list]);

  useEffect(() => {
    if (autoLoad) reload();
  }, [autoLoad, reload]);

  const createItem = useCallback(
    async (data) => {
      setSaving(true);
      try {
        await create(data);
        toast.success(messages.create || 'Đã thêm mới thành công.');
        await reload();
        return true;
      } catch (err) {
        toast.error(err.message || 'Không thể thêm mới.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [create, messages.create, reload, toast],
  );

  const updateItem = useCallback(
    async (id, data) => {
      setSaving(true);
      try {
        await update(id, data);
        toast.success(messages.update || 'Đã cập nhật thành công.');
        await reload();
        return true;
      } catch (err) {
        toast.error(err.message || 'Không thể cập nhật.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [messages.update, reload, toast, update],
  );

  const removeItem = useCallback(
    async (id) => {
      setSaving(true);
      try {
        await remove(id);
        toast.success(messages.remove || 'Đã xóa thành công.');
        await reload();
        return true;
      } catch (err) {
        toast.error(err.message || 'Không thể xóa.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [messages.remove, reload, remove, toast],
  );

  return { items, loading, saving, error, reload, createItem, updateItem, removeItem };
}
