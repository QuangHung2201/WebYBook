import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import Button from '@/components/common/Button/Button';
import { useToast } from '@/app/providers/ToastProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useOrderDetail } from '../hooks/useOrderDetail';
import { orderService } from '../services/orderService';
import OrderDetail from '../components/OrderDetail';
import CancelOrderDialog from '../components/CancelOrderDialog';
import './Orders.css';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const { order, loading, error, refresh } = useOrderDetail(id, user?.id);

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
      <Link to="/orders" className="back-link">
        <ArrowLeft size={16} /> Quay lại danh sách đơn hàng
      </Link>

      {loading ? (
        <Loading label="Đang tải đơn hàng..." />
      ) : error ? (
        <ErrorState title="Không thể tải đơn hàng" message={error} onRetry={refresh} />
      ) : (
        <>
          <OrderDetail order={order} onCancel={setCancelling} />
          <div className="order-detail__continue">
            <Link to="/books">
              <Button variant="outline">Tiếp tục mua sắm</Button>
            </Link>
          </div>
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
