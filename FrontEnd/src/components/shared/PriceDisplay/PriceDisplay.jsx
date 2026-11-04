import { calcDiscountPercent, formatCurrency } from '../../../shared/utils/formatCurrency';
import { cn } from '../../../shared/utils/cn';
import './PriceDisplay.css';

export default function PriceDisplay({ price = 0, discountPrice = 0, size = 'md', showBadge = true, className = '' }) {
  const current = Number(discountPrice) > 0 && Number(discountPrice) < Number(price) ? Number(discountPrice) : Number(price);
  const original = Number(price);
  const percent = calcDiscountPercent(original, current);
  const hasDiscount = percent > 0;

  return (
    <div className={cn('price', `price--${size}`, className)}>
      <span className="price__current">{formatCurrency(current)}</span>
      {hasDiscount ? (
        <span className="price__meta">
          <span className="price__original">{formatCurrency(original)}</span>
          {showBadge ? <span className="price__off">-{percent}%</span> : null}
        </span>
      ) : null}
    </div>
  );
}
