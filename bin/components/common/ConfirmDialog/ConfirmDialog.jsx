import { AlertTriangle } from 'lucide-react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';

export default function ConfirmDialog({
  open,
  title = 'Xác nhận thao tác',
  message = 'Bạn có chắc chắn muốn thực hiện thao tác này?',
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex" style={{ alignItems: 'flex-start' }}>
        <span
          className="error-state__icon"
          style={{ width: 46, height: 46, flexShrink: 0 }}
          aria-hidden="true"
        >
          <AlertTriangle size={22} />
        </span>
        <p className="muted" style={{ paddingTop: 4 }}>
          {message}
        </p>
      </div>
    </Modal>
  );
}
