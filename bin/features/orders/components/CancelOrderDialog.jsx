import ConfirmDialog from '@/components/common/ConfirmDialog/ConfirmDialog';

export default function CancelOrderDialog({ open, order, loading, onConfirm, onClose }) {
  return (
    <ConfirmDialog
      open={open}
      title="Hủy đơn hàng"
      message={
        order
          ? `Bạn có chắc muốn hủy đơn hàng #${order.code}? Thao tác này không thể hoàn tác.`
          : 'Bạn có chắc muốn hủy đơn hàng này?'
      }
      confirmLabel="Hủy đơn"
      cancelLabel="Giữ đơn"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}
