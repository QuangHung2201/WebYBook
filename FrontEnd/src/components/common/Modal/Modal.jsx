import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import './Modal.css';

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer = null,
  size = 'md',
  closeOnOverlay = true,
  hideClose = false,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (closeOnOverlay && event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className={cn('modal', `modal--${size}`)} role="dialog" aria-modal="true" aria-label={title}>
        {title || !hideClose ? (
          <div className="modal__head">
            {title ? <h3 className="modal__title">{title}</h3> : <span />}
            {!hideClose ? (
              <button type="button" className="modal__close" onClick={onClose} aria-label="Đóng">
                <X size={19} />
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="modal__body">{children}</div>
        {footer ? <div className="modal__foot">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
