import { Loader2 } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import './Loading.css';

export default function Loading({ label = 'Đang tải dữ liệu...', fullScreen = false, className = '' }) {
  return (
    <div className={cn('loading', fullScreen && 'loading--full', className)} role="status" aria-live="polite">
      <Loader2 className="loading__spinner" size={fullScreen ? 36 : 26} />
      {label ? <span className="loading__label">{label}</span> : null}
    </div>
  );
}

export function Skeleton({ className = '', style }) {
  return <span className={cn('skeleton', className)} style={style} aria-hidden="true" />;
}

export function BookGridSkeleton({ count = 8 }) {
  return (
    <div className="book-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <Skeleton className="skeleton-card__cover" />
          <Skeleton className="skeleton-card__line" />
          <Skeleton className="skeleton-card__line skeleton-card__line--short" />
          <Skeleton className="skeleton-card__price" />
        </div>
      ))}
    </div>
  );
}
