import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { localStorageAdapter } from '@/infrastructure/storage/localStorageAdapter';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';
import { authService } from '@/features/auth/services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorageAdapter.get(STORAGE_KEYS.AUTH_USER, null));
  const [token, setToken] = useState(() => localStorageAdapter.get(STORAGE_KEYS.AUTH_TOKEN, null));
  const [initializing, setInitializing] = useState(() =>
    Boolean(localStorageAdapter.get(STORAGE_KEYS.AUTH_TOKEN, null)),
  );

  useEffect(() => {
    if (!token) {
      setInitializing(false);
      return undefined;
    }

    let active = true;
    setInitializing(true);

    authService
      .getCurrentUser(token)
      .then((currentUser) => {
        if (!active) return;
        if (currentUser) {
          setUser(currentUser);
          localStorageAdapter.set(STORAGE_KEYS.AUTH_USER, currentUser);
        } else {
          localStorageAdapter.remove(STORAGE_KEYS.AUTH_TOKEN);
          localStorageAdapter.remove(STORAGE_KEYS.AUTH_USER);
          setUser(null);
          setToken(null);
        }
      })
      .catch(() => {
        // Keep the cached user when the mock/API is temporarily unavailable.
      })
      .finally(() => {
        if (active) setInitializing(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

//Lưu JWT vào localStorage với key webybook:auth-token.
//Lưu thông tin user với key webybook:auth-user.
//Cập nhật state token.
//Cập nhật state user.
//  AuthProvider gọi  AuthService chuẩn hóa dữ liệu
  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    localStorageAdapter.set(STORAGE_KEYS.AUTH_TOKEN, result.token);
    localStorageAdapter.set(STORAGE_KEYS.AUTH_USER, result.user);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (data) => {
    const result = await authService.register(data);
    localStorageAdapter.set(STORAGE_KEYS.AUTH_TOKEN, result.token);
    localStorageAdapter.set(STORAGE_KEYS.AUTH_USER, result.user);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      localStorageAdapter.remove(STORAGE_KEYS.AUTH_TOKEN);
      localStorageAdapter.remove(STORAGE_KEYS.AUTH_USER);
      setToken(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (nextUser) localStorageAdapter.set(STORAGE_KEYS.AUTH_USER, nextUser);
  }, []);

  const forgotPassword = useCallback((email) => authService.forgotPassword(email), []);

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
      updateUser,
      forgotPassword,
    }),
    [user, token, initializing, login, register, logout, updateUser, forgotPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
