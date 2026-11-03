import { BookOpen } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import './EmptyState.css';

export default function EmptyState({
  icon: Icon = BookOpen,
  title = 'Chưa có dữ liệu',
  description = '',
  action = null,
  className = '',
}) {
  return (
    <div className={cn('empty-state', className)}>
      <span className="empty-state__icon">
        <Icon size={30} />
      </span>
      <h3 className="empty-state__title">{title}</h3>
      {description ? <p className="empty-state__desc">{description}</p> : null}
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}
