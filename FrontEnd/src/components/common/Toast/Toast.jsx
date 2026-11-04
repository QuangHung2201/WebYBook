import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import './Toast.css';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export default function Toast({ type = 'info', message, onClose }) {
  const Icon = ICONS[type] || Info;
  return (
    <div className={`toast toast--${type}`} role="status">
      <Icon className="toast__icon" size={19} />
      <span className="toast__message">{message}</span>
      <button type="button" className="toast__close" onClick={onClose} aria-label="Đóng thông báo">
        <X size={15} />
      </button>
    </div>
  );
}
