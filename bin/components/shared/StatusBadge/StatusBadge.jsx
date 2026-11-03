import { cn } from '../../../shared/utils/cn';
import './StatusBadge.css';

export default function StatusBadge({ tone = 'info', children, className = '' }) {
  return <span className={cn('badge', `badge--${tone}`, className)}>{children}</span>;
}
