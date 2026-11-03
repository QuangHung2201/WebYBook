import StatusBadge from '@/components/shared/StatusBadge/StatusBadge';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '@/data/constants/orderStatus';

export default function OrderStatus({ status }) {
  return (
    <StatusBadge tone={ORDER_STATUS_TONES[status] || 'neutral'}>
      {ORDER_STATUS_LABELS[status] || status}
    </StatusBadge>
  );
}
