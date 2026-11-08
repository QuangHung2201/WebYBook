import { bookService } from '@/features/books/services/bookService';
import { orderService } from '@/features/orders/services/orderService';
import { userService } from '@/features/users/services/userService';
import { ORDER_STATUS, ORDER_STATUS_LABELS } from '@/data/constants/orderStatus';
import { isApiDataSource } from '@/infrastructure/config/environment';
import { apiDashboardRepository } from '../repositories/apiDashboardRepository';

export const LOW_STOCK_THRESHOLD = 10;

export const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: '#f59f00',
  [ORDER_STATUS.CONFIRMED]: '#1c7ed6',
  [ORDER_STATUS.SHIPPING]: '#7048e8',
  [ORDER_STATUS.DELIVERED]: '#2f9e44',
  [ORDER_STATUS.CANCELLED]: '#d6336c',
};

const effectivePrice = (book) => Number(book.discountPrice) || Number(book.price) || 0;

/** Loads the admin dataset through services (never repositories or mock data). */
export async function loadDataset() {
  const [booksPage, ordersPage, users] = await Promise.all([
    bookService.getBooks({ page: 1, pageSize: 1000 }),
    orderService.getOrders({ page: 1, pageSize: 1000 }),
    userService.getUsers(),
  ]);

  return {
    books: booksPage.items,
    orders: ordersPage.items,
    users,
  };
}

function buildRevenueSeries(orders) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: `T${date.getMonth() + 1}`,
      revenue: 0,
      orders: 0,
    };
  });

  orders
    .filter((order) => order.status !== ORDER_STATUS.CANCELLED)
    .forEach((order) => {
      const date = new Date(order.createdAt);
      const bucket = months.find(
        (month) => month.key === `${date.getFullYear()}-${date.getMonth()}`,
      );
      if (bucket) {
        bucket.revenue += Number(order.total) || 0;
        bucket.orders += 1;
      }
    });

  return months;
}

function buildStatusBreakdown(orders) {
  return Object.values(ORDER_STATUS).map((status) => ({
    status,
    name: ORDER_STATUS_LABELS[status],
    value: orders.filter((order) => order.status === status).length,
    color: STATUS_COLORS[status],
  }));
}

function buildCategoryDistribution(books) {
  const map = new Map();
  books.forEach((book) => {
    const name = book.category?.name || 'Khác';
    const current = map.get(name) || { name, books: 0, stock: 0, value: 0 };
    current.books += 1;
    current.stock += Number(book.stock) || 0;
    current.value += effectivePrice(book) * (Number(book.stock) || 0);
    map.set(name, current);
  });
  return [...map.values()].sort((a, b) => b.value - a.value);
}

function buildTopCustomers(orders) {
  const map = new Map();
  orders
    .filter((order) => order.status !== ORDER_STATUS.CANCELLED)
    .forEach((order) => {
      const key = order.userId ?? order.customerName;
      const current = map.get(key) || {
        userId: order.userId,
        name: order.customerName,
        phone: order.phone,
        orders: 0,
        spent: 0,
      };
      current.orders += 1;
      current.spent += Number(order.total) || 0;
      map.set(key, current);
    });
  return [...map.values()].sort((a, b) => b.spent - a.spent).slice(0, 5);
}

export const dashboardService = {
  loadDataset,

  async getOverview() {
    if (isApiDataSource()) return apiDashboardRepository.getOverview();

    const { books, orders, users } = await loadDataset();
    const validOrders = orders.filter((order) => order.status !== ORDER_STATUS.CANCELLED);
    const totalRevenue = validOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    const stats = {
      totalRevenue,
      orderCount: orders.length,
      bookCount: books.length,
      userCount: users.length,
      activeUserCount: users.filter((user) => user.status === 'ACTIVE').length,
      pendingOrders: orders.filter((order) => order.status === ORDER_STATUS.PENDING).length,
      lowStockCount: books.filter((book) => Number(book.stock) <= LOW_STOCK_THRESHOLD).length,
      averageOrderValue: validOrders.length ? Math.round(totalRevenue / validOrders.length) : 0,
    };

    return {
      stats,
      revenueSeries: buildRevenueSeries(orders),
      statusBreakdown: buildStatusBreakdown(orders),
      categoryDistribution: buildCategoryDistribution(books),
      topCustomers: buildTopCustomers(orders),
      topBooks: [...books].sort((a, b) => Number(b.sold) - Number(a.sold)).slice(0, 5),
      lowStockBooks: books
        .filter((book) => Number(book.stock) <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => Number(a.stock) - Number(b.stock))
        .slice(0, 6),
      recentOrders: [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6),
    };
  },
};
