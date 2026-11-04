import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import './Pagination.css';

function buildPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function Pagination({ page, totalPages, onChange, className = '' }) {
  if (totalPages <= 1) return null;

  return (
    <nav className={cn('pagination', className)} aria-label="Phân trang">
      <button
        type="button"
        className="pagination__btn"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Trang trước"
      >
        <ChevronLeft size={17} />
      </button>

      {buildPages(page, totalPages).map((item, index) =>
        item === '...' ? (
          <span key={`dots-${index}`} className="pagination__dots">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={cn('pagination__btn', item === page && 'is-active')}
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className="pagination__btn"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Trang sau"
      >
        <ChevronRight size={17} />
      </button>
    </nav>
  );
}
