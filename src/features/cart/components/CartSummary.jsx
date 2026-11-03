import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import Button from '@/components/common/Button/Button';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { FREE_SHIPPING_THRESHOLD } from '@/data/constants/shippingMethods';

export default function CartSummary({ subtotal = 0, count = 0, onCheckout, disabled = false }) {
  return (
    <aside className="cart-summary">
      <h3 className="cart-summary__title">Tóm tắt đơn hàng</h3>

      <div className="cart-summary__row">
        <span>Tạm tính ({count} sản phẩm)</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </div>
      <div className="cart-summary__row">
        <span>Phí vận chuyển</span>
        <span className="muted">Tính ở bước thanh toán</span>
      </div>

      <div className="cart-summary__total">
        <span>Tổng cộng</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </div>

      <Button fullWidth size="lg" icon={ArrowRight} onClick={onCheckout} disabled={disabled || count === 0}>
        Tiến hành thanh toán
      </Button>

      <Link to="/books" className="cart-summary__continue">
        Tiếp tục mua sắm
      </Link>

      <div className="cart-summary__perks">
        <span>
          <Truck size={15} /> Miễn phí vận chuyển từ {formatCurrency(FREE_SHIPPING_THRESHOLD)}
        </span>
        <span>
          <ShieldCheck size={15} /> Thanh toán an toàn, bảo mật
        </span>
      </div>
    </aside>
  );
}
