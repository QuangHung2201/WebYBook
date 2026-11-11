import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { BadgePercent, Copy, Ticket } from 'lucide-react';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import Button from '@/components/common/Button/Button';
import { useToast } from '@/app/providers/ToastProvider';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { VOUCHER_TYPE } from '@/data/constants/voucherStatus';
import { useAvailableVouchers } from '../hooks/useAvailableVouchers';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import { normalizeKeyword } from '@/shared/utils/validators';
import './Vouchers.css';

function discountLabel(voucher) {
  if (voucher.type === VOUCHER_TYPE.PERCENT) {
    return `Giảm ${voucher.value}%`;
  }
  return `Giảm ${formatCurrency(voucher.value)}`;
}

export default function VoucherListPage() {
  const { vouchers, loading, error, reload } = useAvailableVouchers('', true);
  const toast = useToast();
  const [keyword, setKeyword] = useState('');
  const filteredVouchers = useMemo(() => {
    const needle = normalizeKeyword(keyword);
    if (!needle) return vouchers;
    return vouchers.filter((voucher) =>
      [voucher.code, voucher.name, voucher.description]
        .map(normalizeKeyword)
        .some((value) => value.includes(needle)),
    );
  }, [keyword, vouchers]);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Đã sao chép mã ${code}.`);
    } catch {
      toast.error('Không thể sao chép mã. Vui lòng chọn và sao chép thủ công.');
    }
  };

  return (
    <div className="page container">
      <div className="page-head">
        <div>
          <h1>Ưu đãi &amp; voucher</h1>
          <p>
            {filteredVouchers.length > 0
              ? `Có ${filteredVouchers.length} voucher phù hợp.`
              : 'Hiện chưa có voucher trong hệ thống.'}
          </p>
        </div>
        <div className="catalog-toolbar__search">
          <SearchInput
            value={keyword}
            onChange={setKeyword}
            placeholder="Tìm theo mã, tên hoặc mô tả voucher..."
            ariaLabel="Tìm kiếm voucher"
          />
        </div>
      </div>

      {loading ? (
        <Loading label="Đang tải voucher..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filteredVouchers.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Chưa có voucher"
          description="Voucher sẽ xuất hiện tại đây khi cửa hàng có chương trình ưu đãi."
          action={
            <Link to="/books" className="btn btn--primary btn--sm">
              Khám phá kho sách
            </Link>
          }
        />
      ) : (
        <div className="voucher-grid">
          {filteredVouchers.map((voucher) => (
            <article key={voucher.id} className="voucher-card">
              <div className="voucher-card__value">
                <BadgePercent size={22} />
                <strong>{discountLabel(voucher)}</strong>
                {voucher.type === VOUCHER_TYPE.PERCENT && voucher.maxDiscount > 0 ? (
                  <span>tối đa {formatCurrency(voucher.maxDiscount)}</span>
                ) : null}
              </div>

              <div className="voucher-card__body">
                <div className="voucher-card__head">
                  <h3>{voucher.name}</h3>
                  <span className="voucher-card__code">{voucher.code}</span>
                </div>
                <strong className={`voucher-card__status voucher-card__status--${String(voucher.lifecycleStatus || 'AVAILABLE').toLowerCase()}`}>
                  {{ AVAILABLE: 'Còn hiệu lực', UPCOMING: 'Chưa đến thời gian áp dụng', EXPIRED: 'Đã hết hạn', USED: 'Đã sử dụng', EXHAUSTED: 'Đã hết lượt', INACTIVE: 'Tạm ngưng' }[voucher.lifecycleStatus || 'AVAILABLE'] || 'Không khả dụng'}
                </strong>
                {voucher.description ? (
                  <p className="voucher-card__desc">{voucher.description}</p>
                ) : null}
                <ul className="voucher-card__meta">
                  <li>
                    Đơn tối thiểu:{' '}
                    <strong>
                      {voucher.minOrder > 0 ? formatCurrency(voucher.minOrder) : 'Không yêu cầu'}
                    </strong>
                  </li>
                  {voucher.startDate ? <li>Bắt đầu: <strong>{formatDate(voucher.startDate)}</strong></li> : null}
                  {voucher.endDate ? <li>Kết thúc: <strong>{formatDate(voucher.endDate)}</strong></li> : null}
                  {voucher.maxDiscount > 0 ? <li>Giảm tối đa: <strong>{formatCurrency(voucher.maxDiscount)}</strong></li> : null}
                  {voucher.quantity > 0 ? (
                    <li>
                      Đã dùng {voucher.used}/{voucher.quantity} lượt
                    </li>
                  ) : null}
                </ul>
                <div className="voucher-card__actions">
                  <Button size="sm" icon={Copy} onClick={() => copyCode(voucher.code)}>
                    Sao chép mã
                  </Button>
                  <Link to="/books" className="voucher-card__shop">
                    Mua sắm ngay
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
