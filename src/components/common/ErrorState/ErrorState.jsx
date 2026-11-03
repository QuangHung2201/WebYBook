import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from '../Button/Button';
import { cn } from '../../../shared/utils/cn';
import './ErrorState.css';

export default function ErrorState({
  title = 'Đã có lỗi xảy ra',
  message = 'Không thể tải dữ liệu. Vui lòng thử lại.',
  onRetry,
  className = '',
}) {
  return (
    <div className={cn('error-state', className)} role="alert">
      <span className="error-state__icon">
        <AlertTriangle size={28} />
      </span>
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__desc">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" icon={RotateCcw} onClick={onRetry}>
          Thử lại
        </Button>
      ) : null}
    </div>
  );
}
