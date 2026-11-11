import AdminLayout from '@/layouts/admin/AdminLayout';
import DashboardPage from '@/features/admin/dashboard/pages/DashboardPage';
import AdminBooksPage from '@/features/admin/books/pages/AdminBooksPage';
import InventoryPage from '@/features/admin/inventory/pages/InventoryPage';
import AdminOrdersPage from '@/features/admin/orders/pages/AdminOrdersPage';
import VouchersPage from '@/features/admin/vouchers/pages/VouchersPage';
import CategoriesPage from '@/features/admin/categories/pages/CategoriesPage';
import AuthorsPage from '@/features/admin/authors/pages/AuthorsPage';
import PublishersPage from '@/features/admin/publishers/pages/PublishersPage';
import UsersPage from '@/features/admin/users/pages/UsersPage';
import ReportsPage from '@/features/admin/reports/pages/ReportsPage';
import AdminReviewsPage from '@/features/admin/reviews/pages/AdminReviewsPage';
import NotFoundPage from '@/app/pages/NotFoundPage';
import '@/features/admin/styles/admin.css';
import ProtectedRoute from './ProtectedRoute';

export const adminRoutes = [
  {
    path: '/admin',
    element: <ProtectedRoute requireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'books', element: <AdminBooksPage /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'orders', element: <AdminOrdersPage /> },
          { path: 'vouchers', element: <VouchersPage /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'authors', element: <AuthorsPage /> },
          { path: 'publishers', element: <PublishersPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'reviews', element: <AdminReviewsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];
