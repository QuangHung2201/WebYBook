import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import Loading, { BookGridSkeleton } from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import { Select } from '@/components/common/Input/Input';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useBooks } from '../hooks/useBooks';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useCart } from '@/features/cart/hooks/useCart';
import { BOOK_SORT_OPTIONS } from '@/data/constants/bookStatus';
import BookGrid from '../components/BookGrid';
import BookFilter from '../components/BookFilter';
import BookSearch from '../components/BookSearch';
import './Books.css';

export default function BookListPage() {
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { categories } = useCategories();

  const initialCategory = searchParams.get('category') || '';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialKeyword = searchParams.get('keyword') || '';

  const {
    books,
    total,
    page,
    totalPages,
    params,
    loading,
    error,
    updateParams,
    setPage,
    refresh,
  } = useBooks({ categoryId: initialCategory, sort: initialSort, keyword: initialKeyword });

  const [keyword, setKeyword] = useState(initialKeyword);
  const [showFilter, setShowFilter] = useState(false);
  const debouncedKeyword = useDebounce(keyword, 350);

  useEffect(() => {
    const nextKeyword = searchParams.get('keyword') || '';
    const nextCategory = searchParams.get('category') || '';
    const nextSort = searchParams.get('sort') || 'newest';

    if (
      nextKeyword !== params.keyword ||
      nextCategory !== params.categoryId ||
      nextSort !== params.sort
    ) {
      setKeyword(nextKeyword);
      updateParams({ keyword: nextKeyword, categoryId: nextCategory, sort: nextSort });
    }
  }, [searchParams, params.keyword, params.categoryId, params.sort, updateParams]);

  useEffect(() => {
    if (debouncedKeyword !== params.keyword) {
      updateParams({ keyword: debouncedKeyword });
    }
  }, [debouncedKeyword, params.keyword, updateParams]);

  const clearFilters = () => {
    setKeyword('');
    updateParams({ keyword: '', categoryId: '', minPrice: '', maxPrice: '', sort: 'newest' });
  };

  return (
    <div className="page container">
      <div className="page-head">
        <div>
          <h1>Kho sách</h1>
          <p>{total > 0 ? `Tìm thấy ${total} đầu sách phù hợp.` : 'Khám phá toàn bộ sách của WebYBook.'}</p>
        </div>
      </div>

      <div className="catalog-toolbar">
        <div className="catalog-toolbar__search">
          <BookSearch value={keyword} onChange={setKeyword} onSubmit={() => updateParams({ keyword })} />
        </div>
        <div className="catalog-toolbar__right">
          <Select
            aria-label="Sắp xếp"
            value={params.sort}
            onChange={(event) => updateParams({ sort: event.target.value })}
            options={BOOK_SORT_OPTIONS}
            className="catalog-toolbar__sort"
          />
          <Button
            variant="outline"
            icon={SlidersHorizontal}
            className="catalog-toolbar__filter-btn"
            onClick={() => setShowFilter((value) => !value)}
          >
            Bộ lọc
          </Button>
        </div>
      </div>

      <div className="catalog-layout">
        <div className={`catalog-sidebar ${showFilter ? 'is-open' : ''}`}>
          <div className="catalog-sidebar__head">
            <strong>Bộ lọc</strong>
            <button type="button" onClick={() => setShowFilter(false)} aria-label="Đóng bộ lọc">
              <X size={18} />
            </button>
          </div>
          <BookFilter
            categories={categories}
            value={params}
            onChange={(patch) => {
              updateParams(patch);
              setShowFilter(false);
            }}
          />
          <button type="button" className="catalog-sidebar__clear" onClick={clearFilters}>
            Xóa tất cả bộ lọc
          </button>
        </div>

        <div className="catalog-main">
          {loading ? (
            <BookGridSkeleton count={9} />
          ) : error ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : books.length === 0 ? (
            <EmptyState
              title="Không tìm thấy sách phù hợp"
              description="Thử thay đổi từ khóa hoặc bộ lọc để tìm được cuốn sách bạn muốn."
              action={<Button onClick={clearFilters}>Xóa bộ lọc</Button>}
            />
          ) : (
            <>
              <BookGrid books={books} onAddToCart={addToCart} />
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
