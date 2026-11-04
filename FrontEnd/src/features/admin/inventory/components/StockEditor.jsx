import { Minus, Plus } from 'lucide-react';

export default function StockEditor({ value, disabled = false, onChange }) {
  const stock = Number(value) || 0;
  const tone = stock === 0 ? 'is-out' : stock <= 10 ? 'is-low' : '';

  return (
    <div className="stock-editor">
      <button
        type="button"
        className="stock-editor__btn"
        onClick={() => onChange(stock - 1)}
        disabled={disabled || stock <= 0}
        aria-label="Giảm tồn kho 1"
      >
        <Minus size={14} />
      </button>
      <span className={`stock-editor__value ${tone}`}>{stock}</span>
      <button
        type="button"
        className="stock-editor__btn"
        onClick={() => onChange(stock + 1)}
        disabled={disabled}
        aria-label="Tăng tồn kho 1"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
