import { Link, useSearchParams } from 'react-router-dom';
import Button from '@/components/common/Button/Button';

export default function PaymentResultPage() {
  const [params] = useSearchParams();
  const paid = params.get('status') === 'PAID';

  return (
    <div className="page container">
      <div className="panel" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <h1>{paid ? 'Thanh toán VNPay thành công' : 'Thanh toán VNPay thất bại'}</h1>
        <p className="muted">
          {paid
            ? 'Đơn hàng đã được ghi nhận thanh toán. Admin sẽ duyệt đơn trong hệ thống.'
            : 'Giao dịch chưa được ghi nhận. Bạn có thể xem lại đơn hàng và thử lại.'}
        </p>
        <Link to="/orders">
          <Button>Xem đơn hàng</Button>
        </Link>
      </div>
    </div>
  );
}
