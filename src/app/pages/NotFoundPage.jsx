import { Link, useLocation } from 'react-router-dom';
import { BookX } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import Button from '@/components/common/Button/Button';

export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div className="page container">
      <EmptyState
        icon={BookX}
        title="Không tìm thấy trang"
        description={`Đường dẫn "${pathname}" không tồn tại hoặc đã bị di chuyển.`}
        action={
          <Link to="/">
            <Button>Về trang chủ</Button>
          </Link>
        }
      />
    </div>
  );
}
