import { Truck, Zap } from 'lucide-react';
import { SHIPPING_METHODS, SHIPPING_METHODS_LIST, FREE_SHIPPING_THRESHOLD } from '@/data/constants/shippingMethods';
import { formatCurrency } from '@/shared/utils/formatCurrency';

const ICONS = {
  [SHIPPING_METHODS.STANDARD]: Truck,
  [SHIPPING_METHODS.EXPRESS]: Zap,
};

export default function ShippingMethodSelector({ value, onChange, subtotal }) {
  const freeShip = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <section className="panel checkout-panel">
      <h3 className="panel-title">Phương thức vận chuyển</h3>
      <div className="option-list">
        {SHIPPING_METHODS_LIST.map((method) => {
          const Icon = ICONS[method.value] || Truck;
          const fee = freeShip ? 0 : method.fee;
          return (
            <label
              key={method.value}
              className={`option-card ${value === method.value ? 'is-selected' : ''}`}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={method.value}
                checked={value === method.value}
                onChange={() => onChange(method.value)}
              />
              <span className="option-card__icon">
                <Icon size={19} />
              </span>
              <span className="option-card__body">
                <strong>{method.label}</strong>
                <span className="muted">{method.description}</span>
              </span>
              <span className="option-card__price">
                {fee === 0 ? <span className="text-success">Miễn phí</span> : formatCurrency(fee)}
              </span>
            </label>
          );
        })}
      </div>
      {freeShip ? (
        <p className="checkout-hint text-success">
          Đơn hàng của bạn đủ điều kiện miễn phí vận chuyển.
        </p>
      ) : null}
    </section>
  );
}
