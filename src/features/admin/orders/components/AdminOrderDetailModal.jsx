import { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal/Modal';
import Button from '@/components/common/Button/Button';
import { Select } from '@/components/common/Input/Input';
import BookCover from '@/components/shared/BookCover/BookCover';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDateTime } from '@/shared/utils/formatDate';
import { ORDER_STATUS, ORDER_STATUS_OPTIONS } from '@/data/constants/orderStatus';
import { PAYMENT_METHOD_LABELS } from '@/data/constants/paymentMethods';
import { SHIPPING_METHODS_LIST } from '@/data/constants/shippingMethods';

function shippingLabel(method) {
  return SHIPPING_METHODS_LIST.find((item) => item.value === method)?.label || method;
}

export default function AdminOrderDetailModal({ open, order, saving, onClose, onUpdateStatus }) {
  const [nextStatus, setNextStatus] = useState(order?.status || ORDER_STATUS.PENDING);

  useEffect(() => {
    if (open) setNextStatus(order?.status || ORDER_STATUS.PENDING);
  }, [open, order]);

  if (!order) return null;

  const submit = async () => {
    const ok = await onUpdateStatus(order.id, nextStatus);
    if (ok) onClose();
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
          <Button
            onClick={submit}
            loading={saving}
            disabled={nextStatus === order.status}
          >
            Cập nhật trạng thái
          </Button>
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

        <Select
          label="Trạng thái đơn hàng"
          value={nextStatus}
          onChange={(event) => setNextStatus(event.target.value)}
          options={ORDER_STATUS_OPTIONS}
          hint="Đơn đã hủy vẫn có thể được mở lại bằng cách đổi sang trạng thái khác."
        />
      </div>
    </Modal>
  );
}
