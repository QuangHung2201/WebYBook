import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import Button from '@/components/common/Button/Button';
import { formatCurrency } from '@/shared/utils/formatCurrency';

export default function VoucherInput({ voucher, loading, onApply, onRemove }) {
  const [code, setCode] = useState('');

  const handleApply = async () => {
    const result = await onApply(code);
    if (result) setCode('');
  };

  return (
    <section className="panel checkout-panel">
      <h3 className="panel-title">
        <Tag size={18} /> Mã giảm giá
      </h3>

      {voucher ? (
        <div className="voucher-applied">
          <div>
            <strong>{voucher.voucher.code}</strong>
            <span className="muted">
              {voucher.voucher.description || 'Đã áp dụng mã giảm giá.'}
            </span>
          </div>
          <div className="voucher-applied__right">
            <span className="text-success">-{formatCurrency(voucher.discount)}</span>
            <button type="button" onClick={onRemove} aria-label="Bỏ mã giảm giá">
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="voucher-form">
          <input
            className="input"
            placeholder="Nhập mã giảm giá (VD: WELCOME10)"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleApply();
              }
            }}
          />
          <Button variant="outline" onClick={handleApply} loading={loading}>
            Áp dụng
          </Button>
        </div>
      )}
    </section>
  );
}
