import { Loader2 } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon: Icon = null,
  className = '',
  type = 'button',
  disabled,
  ...rest
}) {
  return (
    <button
      type={type}
      className={cn('btn', `btn--${variant}`, `btn--${size}`, fullWidth && 'btn--full', className)}
      disabled={loading || disabled}
      {...rest}
    >
      {loading ? <Loader2 className="btn__spinner" size={17} aria-hidden="true" /> : Icon ? <Icon size={17} aria-hidden="true" /> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}
