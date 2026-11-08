import CustomerLayout from '@/layouts/customer/CustomerLayout';
import HomePage from '@/features/books/pages/HomePage';
import BookListPage from '@/features/books/pages/BookListPage';
import BookDetailPage from '@/features/books/pages/BookDetailPage';
import CartPage from '@/features/cart/pages/CartPage';
import CheckoutPage from '@/features/checkout/pages/CheckoutPage';
import OrderHistoryPage from '@/features/orders/pages/OrderHistoryPage';
import OrderDetailPage from '@/features/orders/pages/OrderDetailPage';
import ProfilePage from '@/features/users/pages/ProfilePage';
import ContactPage from '@/features/contact/pages/ContactPage';
import WishlistPage from '@/features/wishlist/pages/WishlistPage';
import VoucherListPage from '@/features/vouchers/pages/VoucherListPage';
import NotFoundPage from '@/app/pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

export const customerRoutes = [
  {
    element: <CustomerLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'books', element: <BookListPage /> },
      { path: 'books/:id', element: <BookDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'vouchers', element: <VoucherListPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'orders', element: <OrderHistoryPage /> },
          { path: 'orders/:id', element: <OrderDetailPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'wishlist', element: <WishlistPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
