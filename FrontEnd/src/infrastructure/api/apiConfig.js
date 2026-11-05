/**
 * Central endpoint catalogue. When the Spring Boot backend is available,
 * only these paths (and the api repositories) need to be verified.
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    me: '/auth/me',
  },
  admin: {
    books: {
      list: '/admin/books',
      detail: (id) => `/admin/books/${id}`,
      create: '/admin/books',
      update: (id) => `/admin/books/${id}`,
      remove: (id) => `/admin/books/${id}`,
    },
    references: (resource) => `/admin/${resource}`,
    reference: (resource, id) => `/admin/${resource}/${id}`,
    users: {
      list: '/admin/users',
      detail: (id) => `/admin/users/${id}`,
      update: (id) => `/admin/users/${id}`,
    },
    orders: {
      list: '/admin/orders',
      detail: (id) => `/admin/orders/${id}`,
      updateStatus: (id) => `/admin/orders/${id}/status`,
    },
    vouchers: {
      list: '/admin/vouchers',
      detail: (id) => `/admin/vouchers/${id}`,
      create: '/admin/vouchers',
      update: (id) => `/admin/vouchers/${id}`,
      remove: (id) => `/admin/vouchers/${id}`,
    },
    dashboard: {
      summary: '/admin/dashboard',
      ordersByStatus: '/admin/dashboard/orders-by-status',
      topBooks: '/admin/dashboard/top-selling-books',
      lowStock: '/admin/dashboard/low-stock',
      revenueDaily: '/admin/dashboard/revenue/daily',
      revenueWeekly: '/admin/dashboard/revenue/weekly',
    },
  },
  books: {
    list: '/books',
    detail: (id) => `/books/${id}`,
    create: '/books',
    update: (id) => `/books/${id}`,
    remove: (id) => `/books/${id}`,
  },
  categories: {
    list: '/categories',
    create: '/categories',
    update: (id) => `/categories/${id}`,
    remove: (id) => `/categories/${id}`,
  },
  authors: {
    list: '/authors',
    create: '/authors',
    update: (id) => `/authors/${id}`,
    remove: (id) => `/authors/${id}`,
  },
  publishers: {
    list: '/publishers',
    create: '/publishers',
    update: (id) => `/publishers/${id}`,
    remove: (id) => `/publishers/${id}`,
  },
  cart: {
    get: '/cart',
    addItem: '/cart/items',
    updateItem: (bookId) => `/cart/items/${bookId}`,
    removeItem: (bookId) => `/cart/items/${bookId}`,
    clear: '/cart',
  },
  orders: {
    list: '/orders',
    detail: (id) => `/orders/${id}`,
    create: '/orders',
    updateStatus: (id) => `/orders/${id}/status`,
    cancel: (id) => `/orders/${id}/cancel`,
  },
  users: {
    me: '/users/me',
    updateMe: '/users/me',
    changePassword: '/users/me/password',
    list: '/users',
    updateRole: (id) => `/users/${id}/role`,
    updateStatus: (id) => `/users/${id}/status`,
  },
  vouchers: {
    list: '/vouchers',
    validate: '/vouchers/validate',
    create: '/vouchers',
    update: (id) => `/vouchers/${id}`,
    remove: (id) => `/vouchers/${id}`,
  },
  reviews: {
    byBook: (bookId) => `/books/${bookId}/reviews`,
    create: (bookId) => `/books/${bookId}/reviews`,
    remove: (id) => `/reviews/${id}`,
  },
  contacts: {
    send: '/contacts',
    list: '/contacts',
  },
  dashboard: {
    stats: '/dashboard/stats',
    revenue: '/dashboard/revenue',
    topBooks: '/dashboard/top-books',
    recentOrders: '/dashboard/recent-orders',
  },
};
