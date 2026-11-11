import { CheckCircle } from 'lucide-react';
import Modal from '@/components/common/Modal/Modal';
import Button from '@/components/common/Button/Button';
import BookCover from '@/components/shared/BookCover/BookCover';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDateTime } from '@/shared/utils/formatDate';
import { ORDER_STATUS } from '@/data/constants/orderStatus';
import { PAYMENT_METHOD_LABELS } from '@/data/constants/paymentMethods';
import { SHIPPING_METHODS_LIST } from '@/data/constants/shippingMethods';

function shippingLabel(method) {
  return SHIPPING_METHODS_LIST.find((item) => item.value === method)?.label || method;
}

export default function AdminOrderDetailModal({ open, order, saving, onClose, onUpdateStatus, onConfirmPayment }) {
  if (!order) return null;

  const runAction = async (action) => {
    const success = await action();
    if (success) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Đơn hàng #${order.code}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Đóng
          </Button>
          {order.status === ORDER_STATUS.PENDING ? (
            <>
              <Button onClick={() => runAction(() => onUpdateStatus(order.id, 'delivered'))} loading={saving}>
                Duyệt đơn
              </Button>
              <Button variant="danger" onClick={() => runAction(() => onUpdateStatus(order.id, 'rejected'))} loading={saving}>
                Từ chối
              </Button>
            </>
          ) : null}
          {order.paymentMethod === 'COD' && order.status === ORDER_STATUS.DELIVERED && order.paymentStatus !== 'PAID' ? (
            <Button icon={CheckCircle} onClick={() => runAction(() => onConfirmPayment(order.id))} loading={saving}>
              Xác nhận đã thu tiền
            </Button>
          ) : null}
        </>
      }
    >
      <div className="admin-order-detail">
        <div className="admin-order-detail__meta">
          <div>
            <span>Khách hàng</span>
            <strong>{order.customerName}</strong>
          </div>
          <div>
            <span>Số điện thoại</span>
            <strong>{order.phone}</strong>
          </div>
          <div>
            <span>Địa chỉ giao hàng</span>
            <strong>{order.address}</strong>
          </div>
          <div>
            <span>Ngày đặt hàng</span>
            <strong>{formatDateTime(order.createdAt)}</strong>
          </div>
          <div>
            <span>Thanh toán</span>
            <strong>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</strong>
          </div>
          <div>
            <span>Trạng thái thanh toán</span>
            <strong>{order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}</strong>
          </div>
          <div>
            <span>Vận chuyển</span>
            <strong>{shippingLabel(order.shippingMethod)}</strong>
          </div>
          <div>
            <span>Mã giảm giá</span>
            <strong>{order.voucherCode || 'Không sử dụng'}</strong>
          </div>
          <div>
            <span>Ghi chú</span>
            <strong>{order.note || 'Không có'}</strong>
          </div>
        </div>

        <div className="admin-order-lines">
          {order.items.map((line) => (
            <div key={`${line.bookId}-${line.title}`} className="admin-order-line">
              <span className="admin-order-line__thumb">
                <BookCover title={line.title} coverImage={line.coverImage} />
              </span>
              <div className="admin-order-line__info">
                <strong>{line.title}</strong>
                <span>
                  {formatCurrency(line.price)} × {line.qty}
                </span>
              </div>
              <strong>{formatCurrency(Number(line.price) * Number(line.qty))}</strong>
            </div>
          ))}
        </div>

        <div className="admin-order-totals">
          <div>
            <span>Tạm tính</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div>
            <span>Phí vận chuyển</span>
            <span>{formatCurrency(order.shippingFee)}</span>
          </div>
          <div>
            <span>Giảm giá</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
          <div className="is-total">
            <span>Tổng cộng</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

      </div>
    </Modal>
  );
}
