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
