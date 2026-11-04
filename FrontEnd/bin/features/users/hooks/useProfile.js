import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/app/providers/ToastProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { userService } from '../services/userService';

export function useProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getProfile(user.id);
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin cá nhân.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = async (data) => {
    setSaving(true);
    try {
      const updated = await userService.updateProfile(user.id, data);
      setProfile(updated);
      updateUser(updated);
      toast.success('Đã cập nhật thông tin cá nhân.');
      return true;
    } catch (err) {
      toast.error(err.message || 'Không thể cập nhật thông tin.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (data) => {
    setSaving(true);
    try {
      await userService.changePassword(user.id, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Đổi mật khẩu thành công.');
      return true;
    } catch (err) {
      toast.error(err.message || 'Không thể đổi mật khẩu.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { profile, loading, saving, error, saveProfile, changePassword, refresh: load };
}
