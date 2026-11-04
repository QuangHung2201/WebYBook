import { Search, X } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import './SearchInput.css';

export default function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Tìm kiếm...',
  className = '',
  ariaLabel = 'Tìm kiếm',
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form className={cn('search-input', className)} onSubmit={handleSubmit} role="search">
      <Search className="search-input__icon" size={18} aria-hidden="true" />
      <input
        className="search-input__field"
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      {value ? (
        <button
          type="button"
          className="search-input__clear"
          onClick={() => onChange?.('')}
          aria-label="Xóa từ khóa"
        >
          <X size={15} />
        </button>
      ) : null}
    </form>
  );
}
