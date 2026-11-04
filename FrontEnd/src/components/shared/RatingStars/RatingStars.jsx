import { Star } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import './RatingStars.css';

export default function RatingStars({ rating = 0, count = null, size = 14, showValue = false, className = '' }) {
  const rounded = Math.round(Number(rating) || 0);

  return (
    <span className={cn('rating-stars', className)} aria-label={`Đánh giá ${Number(rating || 0).toFixed(1)} trên 5`}>
      <span className="rating-stars__icons" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((index) => (
          <Star
            key={index}
            size={size}
            className={cn('rating-stars__star', index <= rounded && 'is-filled')}
          />
        ))}
      </span>
      {showValue ? <span className="rating-stars__value">{Number(rating || 0).toFixed(1)}</span> : null}
      {count !== null && count !== undefined ? <span className="rating-stars__count">({count})</span> : null}
    </span>
  );
}
