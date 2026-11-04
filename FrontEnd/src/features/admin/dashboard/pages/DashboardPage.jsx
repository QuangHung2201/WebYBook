import { BookOpen, Package, RefreshCw, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import Button from '@/components/common/Button/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatCompactCurrency, formatCurrency } from '@/shared/utils/formatCurrency';
import StatCard from '@/features/admin/components/StatCard';
import { useDashboard } from '../hooks/useDashboard';
import RevenueChart from '../components/RevenueChart';
import OrderStatusChart from '../components/OrderStatusChart';
import TopBooksCard from '../components/TopBooksCard';
import LowStockCard from '../components/LowStockCard';
import RecentOrdersCard from '../components/RecentOrdersCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useDashboard();

  if (loading) return <Loading fullScreen label="Đang tổng hợp dữ liệu..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!data) return null;

  const { stats, revenueSeries, statusBreakdown, topBooks, lowStockBooks, recentOrders } = data;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Xin chào, {user?.fullName || 'Quản trị viên'} 👋</h2>
          <p>Tổng quan hoạt động kinh doanh của WebYBook hôm nay.</p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={refresh}>
          Làm mới
        </Button>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Tổng doanh thu"
          value={formatCompactCurrency(stats.totalRevenue)}
          icon={TrendingUp}
          tone="success"
          meta={
            <>
              Giá trị TB/đơn: <strong>{formatCurrency(stats.averageOrderValue)}</strong>
            </>
          }
        />
        <StatCard
          label="Đơn hàng"
          value={stats.orderCount.toLocaleString('vi-VN')}
          icon={ShoppingBag}
          tone="info"
          meta={
            <>
              <strong>{stats.pendingOrders}</strong> đơn chờ xác nhận
            </>
          }
        />
        <StatCard
          label="Đầu sách"
          value={stats.bookCount.toLocaleString('vi-VN')}
          icon={BookOpen}
          tone="warning"
          meta={
            <>
              <strong>{stats.lowStockCount}</strong> đầu sách sắp hết hàng
            </>
          }
        />
        <StatCard
          label="Khách hàng"
          value={stats.userCount.toLocaleString('vi-VN')}
          icon={Users}
          tone="danger"
          meta={
            <>
              <strong>{stats.activeUserCount}</strong> tài khoản đang hoạt động
            </>
          }
        />
      </div>

      <div className="admin-chart-grid">
        <RevenueChart data={revenueSeries} />
        <OrderStatusChart data={statusBreakdown} />
      </div>

      <div className="admin-chart-grid">
        <TopBooksCard books={topBooks} />
        <LowStockCard books={lowStockBooks} />
      </div>

      <RecentOrdersCard orders={recentOrders} />

      <div className="admin-form-note">
        <Package size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
        Dữ liệu được tổng hợp trực tiếp từ đơn hàng, sách và người dùng. Khi chuyển sang API thật,
        trang này không cần thay đổi giao diện.
      </div>
    </div>
  );
}
