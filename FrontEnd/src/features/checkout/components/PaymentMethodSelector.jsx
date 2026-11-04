import { Banknote, Building2, CreditCard, Wallet } from 'lucide-react';
import { PAYMENT_METHODS, PAYMENT_METHOD_OPTIONS } from '@/data/constants/paymentMethods';

const ICONS = {
  [PAYMENT_METHODS.COD]: Banknote,
  [PAYMENT_METHODS.BANK_TRANSFER]: Building2,
  [PAYMENT_METHODS.MOMO]: Wallet,
  [PAYMENT_METHODS.VNPAY]: CreditCard,
};

export default function PaymentMethodSelector({ value, onChange }) {
  return (
    <section className="panel checkout-panel">
      <h3 className="panel-title">Phương thức thanh toán</h3>
      <div className="option-list">
        {PAYMENT_METHOD_OPTIONS.map((method) => {
          const Icon = ICONS[method.value] || CreditCard;
          return (
            <label
              key={method.value}
              className={`option-card ${value === method.value ? 'is-selected' : ''}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={value === method.value}
                onChange={() => onChange(method.value)}
              />
              <span className="option-card__icon">
                <Icon size={19} />
              </span>
              <span className="option-card__body">
                <strong>{method.label}</strong>
                {method.value === PAYMENT_METHODS.COD ? (
                  <span className="muted">Thanh toán khi nhận được hàng</span>
                ) : (
                  <span className="muted">Mô phỏng thanh toán trực tuyến</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
