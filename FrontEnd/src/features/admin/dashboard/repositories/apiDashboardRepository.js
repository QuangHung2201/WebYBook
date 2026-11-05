import { request } from '@/infrastructure/api/apiClient';
import { API_ENDPOINTS } from '@/infrastructure/api/apiConfig';
import { mapOrderFromApi } from '@/shared/mappers/orderMapper';

const unwrap = (payload) => payload?.data ?? payload;

export const apiDashboardRepository = {
  async getOverview() {
    const [summaryPayload, statusPayload, topBooksPayload, lowStockPayload, revenuePayload, ordersPayload] =
      await Promise.all([
        request({ url: API_ENDPOINTS.admin.dashboard.summary }),
        request({ url: API_ENDPOINTS.admin.dashboard.ordersByStatus }),
        request({ url: API_ENDPOINTS.admin.dashboard.topBooks }),
        request({ url: API_ENDPOINTS.admin.dashboard.lowStock }),
        request({ url: API_ENDPOINTS.admin.dashboard.revenueWeekly }),
        request({ url: API_ENDPOINTS.admin.orders.list }),
      ]);

    const summary = unwrap(summaryPayload) || {};
    const statuses = unwrap(statusPayload) || [];
    const topBooks = unwrap(topBooksPayload) || [];
    const lowStockBooks = unwrap(lowStockPayload) || [];
    const revenue = unwrap(revenuePayload) || [];
    const orders = (unwrap(ordersPayload) || []).map(mapOrderFromApi);
    const totalRevenue = Number(summary.total_revenue ?? summary.totalRevenue) || 0;
    const orderCount = Number(summary.total_orders ?? summary.totalOrders) || 0;
    const bookCount = Number(summary.total_books ?? summary.totalBooks) || 0;
    const userCount = Number(summary.total_users ?? summary.totalUsers) || 0;

    return {
      stats: {
        totalRevenue,
        orderCount,
        bookCount,
        userCount,
        activeUserCount: Number(summary.active_users ?? summary.activeUsers) || userCount,
        pendingOrders: Number(summary.pending_orders ?? summary.pendingOrders) || 0,
        lowStockCount: Number(summary.low_stock_books ?? summary.lowStockBooks) || 0,
        averageOrderValue: orderCount ? Math.round(totalRevenue / orderCount) : 0,
      },
      revenueSeries: revenue.map((item) => ({
        label: String(item.week_start ?? item.revenue_date ?? ''),
        revenue: Number(item.revenue) || 0,
        orders: Number(item.order_count) || 0,
      })),
      statusBreakdown: statuses.map((item) => ({
        status: String(item.status || '').toUpperCase(),
        name: String(item.status || '').toUpperCase(),
        value: Number(item.total) || 0,
      })),
      topBooks: topBooks.map((item) => ({
        id: item.id,
        title: item.title || '',
        sold: Number(item.quantity_sold) || 0,
      })),
      categoryDistribution: [],
      topCustomers: [],
      lowStockBooks: lowStockBooks.map((item) => ({
        id: item.id,
        title: item.title || '',
        stock: Number(item.stock_quantity) || 0,
      })),
      recentOrders: orders.slice(0, 6),
    };
  },
};
