import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import Button from '@/components/common/Button/Button';

export default function CartEmpty() {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Giỏ hàng của bạn đang trống"
      description="Hãy khám phá hàng ngàn đầu sách hay và thêm vào giỏ hàng nhé."
      action={
        <Link to="/books">
          <Button>Khám phá sách ngay</Button>
        </Link>
      }
    />
  );
}
