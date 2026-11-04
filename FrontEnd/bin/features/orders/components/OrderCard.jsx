import { Link } from 'react-router-dom';
import BookCover from '@/components/shared/BookCover/BookCover';
import Button from '@/components/common/Button/Button';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { CANCELLABLE_STATUSES } from '@/data/constants/orderStatus';
import OrderStatus from './OrderStatus';

export default function OrderCard({ order, onCancel }) {
  const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);
  const cancellable = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <article className="order-card">
      <header className="order-card__head">
        <div>
          <strong className="order-card__code">#{order.code}</strong>
          <span className="order-card__date">{formatDate(order.createdAt)}</span>
        </div>
        <OrderStatus status={order.status} />
      </header>

      <div className="order-card__items">
        {order.items.slice(0, 4).map((item) => (
          <div key={`${order.id}-${item.bookId}`} className="order-card__thumb">
            <BookCover title={item.title} coverImage={item.coverImage} />
            <span>x{item.qty}</span>
          </div>
        ))}
        {order.items.length > 4 ? (
          <span className="order-card__more">+{order.items.length - 4}</span>
        ) : null}
      </div>

      <footer className="order-card__foot">
        <div className="order-card__total">
          <span>{totalQty} sản phẩm</span>
          <strong>{formatCurrency(order.total)}</strong>
        </div>
        <div className="order-card__actions">
          {cancellable && onCancel ? (
            <Button variant="ghost" size="sm" onClick={() => onCancel(order)}>
              Hủy đơn
            </Button>
          ) : null}
          <Link to={`/orders/${order.id}`}>
            <Button variant="outline" size="sm">
              Xem chi tiết
            </Button>
          </Link>
        </div>
      </footer>
    </article>
  );
}
