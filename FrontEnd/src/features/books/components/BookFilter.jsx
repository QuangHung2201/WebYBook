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

const RATING_OPTIONS = [
  { label: 'Từ 4 sao', value: 4 },
  { label: 'Từ 3 sao', value: 3 },
];

export default function BookFilter({
  categories = [],
  authors = [],
  publishers = [],
  value = {},
  onChange,
  onReset,
}) {
  const [minPrice, setMinPrice] = useState(value.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(value.maxPrice ?? '');
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    setMinPrice(value.minPrice ?? '');
    setMaxPrice(value.maxPrice ?? '');
    setPriceError('');
  }, [value.minPrice, value.maxPrice]);

  const activeRange = PRICE_RANGES.findIndex(
    (range) => String(range.min) === String(value.minPrice) && String(range.max) === String(value.maxPrice),
  );

  const handleApplyPrice = () => {
    const minVal = minPrice !== '' ? Number(minPrice) : null;
    const maxVal = maxPrice !== '' ? Number(maxPrice) : null;

    if (minVal !== null && (Number.isNaN(minVal) || minVal < 0)) {
      setPriceError('Giá thấp nhất không được là số âm');
      return;
    }
    if (maxVal !== null && (Number.isNaN(maxVal) || maxVal < 0)) {
      setPriceError('Giá cao nhất không được là số âm');
      return;
    }
    if (minVal !== null && maxVal !== null && minVal > maxVal) {
      setPriceError('Giá thấp nhất không được lớn hơn giá cao nhất');
      return;
    }

    setPriceError('');
    onChange({ minPrice, maxPrice });
  };

  const handlePriceRangeClick = (range) => {
    setPriceError('');
    setMinPrice(range.min);
    setMaxPrice(range.max);
    onChange({ minPrice: range.min, maxPrice: range.max });
  };

  return (
    <aside className="book-filter">
      <div className="book-filter__group">
        <h4 className="book-filter__title">Danh mục thể loại</h4>
        <div className="book-filter__list">
          <button
            type="button"
            className={cn('book-filter__item', !value.categoryId && 'is-active')}
            onClick={() => onChange({ categoryId: '' })}
          >
            Tất cả thể loại
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
              <span className="book-filter__count">{category.bookCount ?? category.book_count ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="book-filter__group">
        <h4 className="book-filter__title">Tác giả</h4>
        <select
          className="select"
          aria-label="Lọc theo tác giả"
          value={value.authorId ?? ''}
          onChange={(event) => onChange({ authorId: event.target.value })}
        >
          <option value="">Tất cả tác giả</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </select>
      </div>

      <div className="book-filter__group">
        <h4 className="book-filter__title">Nhà xuất bản</h4>
        <select
          className="select"
          aria-label="Lọc theo nhà xuất bản"
          value={value.publisherId ?? ''}
          onChange={(event) => onChange({ publisherId: event.target.value })}
        >
          <option value="">Tất cả nhà xuất bản</option>
          {publishers.map((publisher) => (
            <option key={publisher.id} value={publisher.id}>
              {publisher.name}
            </option>
          ))}
        </select>
      </div>

      <div className="book-filter__group">
        <h4 className="book-filter__title">Đánh giá sao</h4>
        <div className="book-filter__list">
          <button
            type="button"
            className={cn('book-filter__item', !value.minRating && 'is-active')}
            onClick={() => onChange({ minRating: '' })}
          >
            Mọi mức đánh giá
          </button>
          {RATING_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                'book-filter__item',
                String(value.minRating) === String(option.value) && 'is-active',
              )}
              onClick={() => onChange({ minRating: option.value })}
            >
              {option.label}
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
              onClick={() => handlePriceRangeClick(range)}
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
            placeholder="Từ ₫"
            value={minPrice}
            onChange={(event) => {
              setMinPrice(event.target.value);
              setPriceError('');
            }}
          />
          <span>—</span>
          <input
            className="input"
            type="number"
            min="0"
            placeholder="Đến ₫"
            value={maxPrice}
            onChange={(event) => {
              setMaxPrice(event.target.value);
              setPriceError('');
            }}
          />
        </div>
        {priceError ? (
          <p className="book-filter__error" role="alert">
            {priceError}
          </p>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={handleApplyPrice}
        >
          Áp dụng giá
        </Button>
        {value.minPrice || value.maxPrice ? (
          <p className="book-filter__hint">
            Đang lọc: {value.minPrice ? formatCurrency(value.minPrice) : '0₫'} -{' '}
            {value.maxPrice ? formatCurrency(value.maxPrice) : 'không giới hạn'}
          </p>
        ) : null}
      </div>

      {onReset ? (
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={onReset}
          className="catalog-sidebar__reset-btn"
        >
          Xóa tất cả bộ lọc
        </Button>
      ) : null}
    </aside>
  );
}
