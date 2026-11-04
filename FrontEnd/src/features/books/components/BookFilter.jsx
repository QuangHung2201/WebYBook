import { useEffect, useState } from 'react';
import Button from '@/components/common/Button/Button';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { cn } from '@/shared/utils/cn';

const PRICE_RANGES = [
  { label: 'Dưới 100.000₫', min: 0, max: 100000 },
  { label: '100.000₫ - 200.000₫', min: 100000, max: 200000 },
  { label: '200.000₫ - 350.000₫', min: 200000, max: 350000 },
  { label: 'Trên 350.000₫', min: 350000, max: '' },
];

export default function BookFilter({ categories = [], value = {}, onChange }) {
  const [minPrice, setMinPrice] = useState(value.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(value.maxPrice ?? '');

  useEffect(() => {
    setMinPrice(value.minPrice ?? '');
    setMaxPrice(value.maxPrice ?? '');
  }, [value.minPrice, value.maxPrice]);

  const activeRange = PRICE_RANGES.findIndex(
    (range) => String(range.min) === String(value.minPrice) && String(range.max) === String(value.maxPrice),
  );

  return (
    <aside className="book-filter">
      <div className="book-filter__group">
        <h4 className="book-filter__title">Danh mục</h4>
        <div className="book-filter__list">
          <button
            type="button"
            className={cn('book-filter__item', !value.categoryId && 'is-active')}
            onClick={() => onChange({ categoryId: '' })}
          >
            Tất cả sách
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={cn(
                'book-filter__item',
                String(value.categoryId) === String(category.id) && 'is-active',
              )}
              onClick={() => onChange({ categoryId: category.id })}
            >
              <span>{category.name}</span>
              <span className="book-filter__count">{category.bookCount ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="book-filter__group">
        <h4 className="book-filter__title">Khoảng giá</h4>
        <div className="book-filter__list">
          {PRICE_RANGES.map((range, index) => (
            <button
              key={range.label}
              type="button"
              className={cn('book-filter__item', activeRange === index && 'is-active')}
              onClick={() => onChange({ minPrice: range.min, maxPrice: range.max })}
            >
              {range.label}
            </button>
          ))}
        </div>
        <div className="book-filter__price">
          <input
            className="input"
            type="number"
            min="0"
            placeholder="Từ"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
          <span>—</span>
          <input
            className="input"
            type="number"
            min="0"
            placeholder="Đến"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => onChange({ minPrice, maxPrice })}
        >
          Áp dụng giá
        </Button>
        {(value.minPrice || value.maxPrice) ? (
          <p className="book-filter__hint">
            Đang lọc: {value.minPrice ? formatCurrency(value.minPrice) : '0₫'} -{' '}
            {value.maxPrice ? formatCurrency(value.maxPrice) : 'không giới hạn'}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
