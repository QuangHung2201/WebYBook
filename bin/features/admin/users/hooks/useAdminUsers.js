import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/app/providers/ToastProvider';
import { userService } from '@/features/users/services/userService';

export function useAdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    userService
      .getUsers()
      .then((result) => {
        if (active) setUsers(result);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Không thể tải danh sách người dùng.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  const updateRole = useCallback(
    async (userId, role) => {
      setSavingId(userId);
      try {
        await userService.updateRole(userId, role);
        toast.success('Đã cập nhật vai trò người dùng.');
        refresh();
        return true;
      } catch (err) {
        toast.error(err.message || 'Không thể cập nhật vai trò.');
        return false;
      } finally {
        setSavingId(null);
      }
    },
    [refresh, toast],
  );

  const updateStatus = useCallback(
    async (userId, status) => {
      setSavingId(userId);
      try {
        await userService.updateStatus(userId, status);
        toast.success('Đã cập nhật trạng thái tài khoản.');
        refresh();
        return true;
      } catch (err) {
        toast.error(err.message || 'Không thể cập nhật trạng thái.');
        return false;
      } finally {
        setSavingId(null);
      }
    },
    [refresh, toast],
  );

  return { users, loading, error, savingId, refresh, updateRole, updateStatus };
}
