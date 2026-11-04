import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';
import { AuthProvider } from './AuthProvider';

export default function AppProvider({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
