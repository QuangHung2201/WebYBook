import { Download, RefreshCw, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import Button from '@/components/common/Button/Button';
import StatCard from '@/features/admin/components/StatCard';
import { formatCompactCurrency, formatCurrency } from '@/shared/utils/formatCurrency';
import { useDashboard } from '@/features/admin/dashboard/hooks/useDashboard';
import RevenueBarChart from '../components/RevenueBarChart';

function downloadCsv(filename, rows) {
  const header = ['Danh mục', 'Số đầu sách', 'Tồn kho', 'Giá trị tồn kho'];
  const lines = rows.map((row) =>
    [row.name, row.books, row.stock, row.value]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(','),
  );
  const csv = `\uFEFF${[header.join(','), ...lines].join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { data, loading, error, refresh } = useDashboard();

  if (loading) return <Loading fullScreen label="Đang tổng hợp báo cáo..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!data) return null;

  const { stats, revenueSeries, statusBreakdown, categoryDistribution, topCustomers } = data;
  const totalOrders = statusBreakdown.reduce((sum, item) => sum + item.value, 0);
  const maxCategoryValue = categoryDistribution[0]?.value || 1;

  const handleExport = () => {
    downloadCsv(
      `webybook-ton-kho-${new Date().toISOString().slice(0, 10)}.csv`,
      categoryDistribution,
    );
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Báo cáo</h2>
          <p>Phân tích doanh thu, đơn hàng và hiệu quả kinh doanh theo danh mục.</p>
        </div>
        <div className="flex" style={{ flexWrap: 'wrap' }}>
          <Button variant="outline" icon={RefreshCw} onClick={refresh}>
            Làm mới
          </Button>
          <Button icon={Download} onClick={handleExport}>
            Xuất CSV tồn kho
          </Button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Doanh thu hợp lệ"
          value={formatCompactCurrency(stats.totalRevenue)}
          icon={TrendingUp}
          tone="success"
          meta={<>Giá trị TB/đơn: {formatCurrency(stats.averageOrderValue)}</>}
        />
        <StatCard
          label="Tổng đơn hàng"
          value={stats.orderCount}
          icon={ShoppingBag}
          tone="info"
          meta={<>{stats.pendingOrders} đơn đang chờ xác nhận</>}
        />
        <StatCard
          label="Khách hàng"
          value={stats.userCount}
          icon={Users}
          tone="warning"
          meta={<>{stats.activeUserCount} tài khoản hoạt động</>}
        />
        <StatCard
          label="Giá trị tồn kho"
          value={formatCompactCurrency(
            categoryDistribution.reduce((sum, item) => sum + item.value, 0),
          )}
          icon={ShoppingBag}
          tone="danger"
          meta={<>{stats.lowStockCount} đầu sách sắp hết</>}
        />
      </div>

      <section className="admin-report-card admin-report-card--wide">
        <div className="admin-report-card__head">
          <div>
            <h3>Doanh thu theo tháng</h3>
            <p>6 tháng gần nhất, không gồm đơn đã hủy</p>
          </div>
        </div>
        <RevenueBarChart data={revenueSeries} />
      </section>

      <div className="admin-report-grid">
        <section className="admin-report-card">
          <div className="admin-report-card__head">
            <div>
              <h3>Phân bố trạng thái đơn</h3>
              <p>{totalOrders} đơn hàng trong hệ thống</p>
            </div>
          </div>
          <div className="admin-progress-list">
            {statusBreakdown.map((item) => {
              const percent = totalOrders ? Math.round((item.value / totalOrders) * 100) : 0;
              return (
                <div key={item.status} className="admin-progress">
                  <div className="admin-progress__head">
                    <strong>{item.name}</strong>
                    <span>
                      {item.value} đơn · {percent}%
                    </span>
                  </div>
                  <span className="admin-progress__track">
                    <span
                      className="admin-progress__fill"
                      style={{ width: `${percent}%`, background: item.color }}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="admin-report-card">
          <div className="admin-report-card__head">
            <div>
              <h3>Hiệu quả theo danh mục</h3>
              <p>Giá trị tồn kho theo giá bán hiện tại</p>
            </div>
          </div>
          <div className="admin-progress-list">
            {categoryDistribution.slice(0, 8).map((category) => {
              const percent = Math.round((category.value / maxCategoryValue) * 100);
              return (
                <div key={category.name} className="admin-progress">
                  <div className="admin-progress__head">
                    <strong>{category.name}</strong>
                    <span>{formatCompactCurrency(category.value)}</span>
                  </div>
                  <span className="admin-progress__track">
                    <span className="admin-progress__fill" style={{ width: `${percent}%` }} />
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="admin-report-grid">
        <section className="admin-report-card">
          <div className="admin-report-card__head">
            <div>
              <h3>Khách hàng chi tiêu cao nhất</h3>
              <p>Xếp theo tổng giá trị đơn hàng hợp lệ</p>
            </div>
          </div>
          {topCustomers.length === 0 ? (
            <p className="muted">Chưa có dữ liệu khách hàng.</p>
          ) : (
            <div className="admin-list">
              {topCustomers.map((customer, index) => (
                <div key={`${customer.userId}-${customer.name}`} className="admin-list__item">
                  <span className={`admin-list__rank ${index < 3 ? 'admin-list__rank--top' : ''}`}>
                    {index + 1}
                  </span>
                  <div className="admin-list__body">
                    <strong>{customer.name}</strong>
                    <span>{customer.phone || 'Chưa có SĐT'}</span>
                  </div>
                  <span className="admin-list__value">
                    {formatCompactCurrency(customer.spent)}
                    <small>{customer.orders} đơn</small>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="admin-report-card">
          <div className="admin-report-card__head">
            <div>
              <h3>Tồn kho theo danh mục</h3>
              <p>Số đầu sách và số lượng sách còn trong kho</p>
            </div>
          </div>
          <div className="table-wrap admin-table-wrap">
            <table className="data-table" style={{ minWidth: 420 }}>
              <thead>
                <tr>
                  <th>Danh mục</th>
                  <th>Đầu sách</th>
                  <th>Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {categoryDistribution.map((category) => (
                  <tr key={category.name}>
                    <td>
                      <strong>{category.name}</strong>
                    </td>
                    <td>{category.books}</td>
                    <td>{category.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
