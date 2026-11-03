import { useRoutes } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import { customerRoutes } from './customerRoutes';
import { adminRoutes } from './adminRoutes';

const routes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  ...customerRoutes,
  ...adminRoutes,
];

export default function AppRouter() {
  return useRoutes(routes);
}
