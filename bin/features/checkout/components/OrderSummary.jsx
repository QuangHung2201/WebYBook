import { Link } from 'react-router-dom';
import Button from '@/components/common/Button/Button';
import BookCover from '@/components/shared/BookCover/BookCover';
import { formatCurrency } from '@/shared/utils/formatCurrency';

export default function OrderSummary({
  items,
  subtotal,
  shippingFee,
  discount,
  total,
  placing,
  onPlaceOrder,
}) {
  return (
    <aside className="checkout-summary">
      <h3 className="checkout-summary__title">Đơn hàng của bạn</h3>

      <div className="checkout-summary__items">
        {items.map((item) => (
          <div key={item.book.id} className="checkout-summary__item">
            <Link to={`/books/${item.book.id}`} className="checkout-summary__cover">
              <BookCover title={item.book.title} coverImage={item.book.coverImage} />
              <span className="checkout-summary__qty">{item.qty}</span>
            </Link>
            <div className="checkout-summary__info">
              <span>{item.book.title}</span>
              <span className="muted">
                {formatCurrency(
                  (Number(item.book.discountPrice) || Number(item.book.price)) * item.qty,
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="checkout-summary__rows">
        <div>
          <span>Tạm tính</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div>
          <span>Phí vận chuyển</span>
          <strong>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</strong>
        </div>
        {discount > 0 ? (
          <div>
            <span>Giảm giá</span>
            <strong className="text-success">-{formatCurrency(discount)}</strong>
          </div>
        ) : null}
        <div className="checkout-summary__total">
          <span>Tổng thanh toán</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </div>

      <Button fullWidth size="lg" onClick={onPlaceOrder} loading={placing} disabled={items.length === 0}>
        Đặt hàng
      </Button>
      <p className="checkout-summary__note">
        Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của WebYBook.
      </p>
    </aside>
  );
}
