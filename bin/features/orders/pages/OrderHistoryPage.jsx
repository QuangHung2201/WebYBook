import { useState } from 'react';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import { useToast } from '@/app/providers/ToastProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ORDER_STATUS_OPTIONS } from '@/data/constants/orderStatus';
import { useOrders } from '../hooks/useOrders';
import { orderService } from '../services/orderService';
import OrderCard from '../components/OrderCard';
import CancelOrderDialog from '../components/CancelOrderDialog';
import './Orders.css';

const FILTERS = [{ value: '', label: 'Tất cả' }, ...ORDER_STATUS_OPTIONS];

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { orders, loading, error, page, totalPages, params, updateParams, setPage, refresh } = useOrders({
    userId: user?.id,
  });

  const [cancelling, setCancelling] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = async () => {
    if (!cancelling) return;
    setSubmitting(true);
    try {
      await orderService.cancelOrder(cancelling.id, user?.id);
      toast.success(`Đã hủy đơn hàng #${cancelling.code}.`);
      setCancelling(null);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Không thể hủy đơn hàng.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page container">
      <div className="page-head">
        <div>
          <h1>Đơn hàng của tôi</h1>
          <p>Theo dõi trạng thái và lịch sử mua sắm của bạn.</p>
        </div>
      </div>

      <div className="order-filters" role="tablist" aria-label="Lọc theo trạng thái">
        {FILTERS.map((filter) => (
          <button
            key={filter.value || 'all'}
            type="button"
            role="tab"
            aria-selected={params.status === filter.value}
            className={`order-filters__tab ${params.status === filter.value ? 'is-active' : ''}`}
            onClick={() => updateParams({ status: filter.value })}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading label="Đang tải đơn hàng..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Chưa có đơn hàng nào"
          description="Bạn chưa có đơn hàng ở trạng thái này. Hãy khám phá sách và đặt đơn đầu tiên nhé."
          action={
            <Link to="/books">
              <Button>Mua sách ngay</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="order-list">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onCancel={setCancelling} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <CancelOrderDialog
        open={Boolean(cancelling)}
        order={cancelling}
        loading={submitting}
        onConfirm={handleCancel}
        onClose={() => setCancelling(null)}
      />
    </div>
  );
}
