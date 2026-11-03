import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { localStorageAdapter } from '@/infrastructure/storage/localStorageAdapter';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorageAdapter.get(STORAGE_KEYS.THEME, 'light'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorageAdapter.set(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, isDark: theme === 'dark' }),
    [theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme phải được dùng bên trong <ThemeProvider>');
  return context;
}
