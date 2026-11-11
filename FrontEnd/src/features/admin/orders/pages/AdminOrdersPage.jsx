import { useEffect, useState } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import OrderStatus from '@/features/orders/components/OrderStatus';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDateTime } from '@/shared/utils/formatDate';
import { ORDER_STATUS_OPTIONS } from '@/data/constants/orderStatus';
import { useAdminOrders } from '../hooks/useAdminOrders';
import AdminOrderDetailModal from '../components/AdminOrderDetailModal';

const STATUS_FILTERS = [{ value: '', label: 'Tất cả trạng thái' }, ...ORDER_STATUS_OPTIONS];

export default function AdminOrdersPage() {
  const {
    orders,
    total,
    page,
    totalPages,
    params,
    loading,
    saving,
    error,
    updateParams,
    setPage,
    refresh,
    updateStatus,
    confirmPayment,
  } = useAdminOrders();

  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState(null);
  const debouncedKeyword = useDebounce(keyword, 350);

  useEffect(() => {
    if (debouncedKeyword !== params.keyword) updateParams({ keyword: debouncedKeyword });
  }, [debouncedKeyword, params.keyword, updateParams]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Đơn hàng</h2>
          <p>Theo dõi toàn bộ đơn hàng và cập nhật tiến trình giao hàng.</p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={refresh} loading={loading}>
          Làm mới
        </Button>
      </div>

      <div className="admin-filters">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          onSubmit={(value) => updateParams({ keyword: value })}
          placeholder="Tìm theo mã đơn, tên, số điện thoại..."
        />
        <Select
          aria-label="Lọc theo trạng thái đơn"
          value={params.status}
          onChange={(event) => updateParams({ status: event.target.value })}
          options={STATUS_FILTERS}
        />
        <span className="admin-count">{total} đơn hàng</span>
      </div>

      {loading ? (
        <Loading label="Đang tải đơn hàng..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <div className="admin-table-card">
          <div className="table-wrap admin-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        title="Không tìm thấy đơn hàng"
                        description="Thử đổi từ khóa hoặc trạng thái đang lọc."
                      />
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.code}</strong>
                      </td>
                      <td>
                        <div className="admin-user-cell">
                          <span className="admin-user-cell__avatar">
                            {(order.customerName || 'K').charAt(0).toUpperCase()}
                          </span>
                          <div className="admin-user-cell__info">
                            <strong>{order.customerName}</strong>
                            <span>{order.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="muted">{formatDateTime(order.createdAt)}</td>
                      <td className="admin-money">{formatCurrency(order.total)}</td>
                      <td>
                        <OrderStatus status={order.status} />
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-action-btn"
                            onClick={() => setSelected(order)}
                            aria-label={`Xem đơn ${order.code}`}
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} className="admin-pagination" />
        </div>
      )}

      <AdminOrderDetailModal
        open={Boolean(selected)}
        order={selected}
        saving={saving}
        onClose={() => setSelected(null)}
        onUpdateStatus={updateStatus}
        onConfirmPayment={confirmPayment}
      />
    </div>
  );
}
