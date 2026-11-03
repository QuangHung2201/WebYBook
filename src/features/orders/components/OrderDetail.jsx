import { Link } from 'react-router-dom';
import BookCover from '@/components/shared/BookCover/BookCover';
import Button from '@/components/common/Button/Button';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDateTime } from '@/shared/utils/formatDate';
import { PAYMENT_METHOD_LABELS } from '@/data/constants/paymentMethods';
import { SHIPPING_METHODS_LIST } from '@/data/constants/shippingMethods';
import { CANCELLABLE_STATUSES } from '@/data/constants/orderStatus';
import OrderStatus from './OrderStatus';

export default function OrderDetail({ order, onCancel }) {
  if (!order) return null;

  const shipping = SHIPPING_METHODS_LIST.find((item) => item.value === order.shippingMethod);
  const cancellable = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <div className="order-detail">
      <div className="order-detail__head">
        <div>
          <h1>Đơn hàng #{order.code}</h1>
          <p className="muted">Đặt lúc {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="order-detail__head-actions">
          <OrderStatus status={order.status} />
          {cancellable && onCancel ? (
            <Button variant="outline" size="sm" onClick={() => onCancel(order)}>
              Hủy đơn hàng
            </Button>
          ) : null}
        </div>
      </div>

      <div className="order-detail__grid">
        <section className="panel">
          <h3 className="panel-title">Thông tin nhận hàng</h3>
          <dl className="info-list">
            <div>
              <dt>Người nhận</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt>Số điện thoại</dt>
              <dd>{order.phone}</dd>
            </div>
            <div>
              <dt>Địa chỉ</dt>
              <dd>{order.address}</dd>
            </div>
            {order.note ? (
              <div>
                <dt>Ghi chú</dt>
                <dd>{order.note}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="panel">
          <h3 className="panel-title">Thanh toán &amp; vận chuyển</h3>
          <dl className="info-list">
            <div>
              <dt>Phương thức thanh toán</dt>
              <dd>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</dd>
            </div>
            <div>
              <dt>Phương thức vận chuyển</dt>
              <dd>{shipping?.label || order.shippingMethod}</dd>
            </div>
            {order.voucherCode ? (
              <div>
                <dt>Voucher</dt>
                <dd>{order.voucherCode}</dd>
              </div>
            ) : null}
            <div>
              <dt>Cập nhật gần nhất</dt>
              <dd>{formatDateTime(order.updatedAt)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="panel order-detail__items">
        <h3 className="panel-title">Sản phẩm ({order.items.length})</h3>
        <div className="order-detail__list">
          {order.items.map((item) => (
            <div key={`${order.id}-${item.bookId}`} className="order-line">
              <Link to={`/books/${item.bookId}`} className="order-line__cover">
                <BookCover title={item.title} coverImage={item.coverImage} />
              </Link>
              <div className="order-line__info">
                <Link to={`/books/${item.bookId}`}>{item.title}</Link>
                <span className="muted">{formatCurrency(item.price)}</span>
              </div>
              <span className="order-line__qty">x{item.qty}</span>
              <strong className="order-line__total">{formatCurrency(item.price * item.qty)}</strong>
            </div>
          ))}
        </div>

        <div className="order-detail__summary">
          <div>
            <span>Tạm tính</span>
            <strong>{formatCurrency(order.subtotal)}</strong>
          </div>
          <div>
            <span>Phí vận chuyển</span>
            <strong>{order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}</strong>
          </div>
          {order.discount > 0 ? (
            <div>
              <span>Giảm giá</span>
              <strong className="text-success">-{formatCurrency(order.discount)}</strong>
            </div>
          ) : null}
          <div className="order-detail__grand-total">
            <span>Tổng cộng</span>
            <strong>{formatCurrency(order.total)}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
