import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Building2, SlidersHorizontal, Tag, User, X } from 'lucide-react';
import Loading, { BookGridSkeleton } from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import { Select } from '@/components/common/Input/Input';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useBooks } from '../hooks/useBooks';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useAuthors } from '@/features/authors/hooks/useAuthors';
import { usePublishers } from '@/features/publishers/hooks/usePublishers';
import { useCart } from '@/features/cart/hooks/useCart';
import { BOOK_SORT_OPTIONS } from '@/data/constants/bookStatus';
import BookGrid from '../components/BookGrid';
import BookFilter from '../components/BookFilter';
import BookSearch from '../components/BookSearch';
import './Books.css';

export default function BookListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { categories } = useCategories();
  const { authors } = useAuthors();
  const { publishers } = usePublishers();

  const initialCategory = searchParams.get('category') || searchParams.get('categoryId') || '';
  const initialAuthor = searchParams.get('author') || searchParams.get('authorId') || '';
  const initialPublisher = searchParams.get('publisher') || searchParams.get('publisherId') || '';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialKeyword = searchParams.get('keyword') || searchParams.get('search') || '';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialMinRating = searchParams.get('minRating') || '';
  const initialPage = Number(searchParams.get('page')) || 1;

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
  } = useBooks({
    categoryId: initialCategory,
    authorId: initialAuthor,
    publisherId: initialPublisher,
    sort: initialSort,
    keyword: initialKeyword,
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
    minRating: initialMinRating,
    page: initialPage,
  });

  // Keep the latest catalog state available to URL navigation sync without
  // rerunning that sync merely because a filter changed in component state.
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const [keyword, setKeyword] = useState(initialKeyword);
  const [showFilter, setShowFilter] = useState(false);
  const debouncedKeyword = useDebounce(keyword, 350);

  // Đồng bộ từ URL searchParams khi URL thay đổi từ ngoài (ví dụ click menu hoặc breadcrumb)
  useEffect(() => {
    const nextCategory = searchParams.get('category') || searchParams.get('categoryId') || '';
    const nextAuthor = searchParams.get('author') || searchParams.get('authorId') || '';
    const nextPublisher = searchParams.get('publisher') || searchParams.get('publisherId') || '';
    const nextSort = searchParams.get('sort') || 'newest';
    const nextKeyword = searchParams.get('keyword') || searchParams.get('search') || '';
    const nextMinPrice = searchParams.get('minPrice') || '';
    const nextMaxPrice = searchParams.get('maxPrice') || '';
    const nextMinRating = searchParams.get('minRating') || '';
    const nextPage = Number(searchParams.get('page')) || 1;

    const hasChanged =
      nextCategory !== (paramsRef.current.categoryId ?? '') ||
      nextAuthor !== (paramsRef.current.authorId ?? '') ||
      nextPublisher !== (paramsRef.current.publisherId ?? '') ||
      nextSort !== (paramsRef.current.sort ?? 'newest') ||
      nextKeyword !== (paramsRef.current.keyword ?? '') ||
      nextMinPrice !== (paramsRef.current.minPrice ?? '') ||
      nextMaxPrice !== (paramsRef.current.maxPrice ?? '') ||
      nextMinRating !== (paramsRef.current.minRating ?? '') ||
      nextPage !== paramsRef.current.page;

    if (hasChanged) {
      setKeyword(nextKeyword);
      updateParams({
        categoryId: nextCategory,
        authorId: nextAuthor,
        publisherId: nextPublisher,
        sort: nextSort,
        keyword: nextKeyword,
        minPrice: nextMinPrice,
        maxPrice: nextMaxPrice,
        minRating: nextMinRating,
        page: nextPage,
      });
    }
  }, [searchParams, updateParams]);

  // Cập nhật khi debounce từ khóa tìm kiếm
  useEffect(() => {
    if (debouncedKeyword !== params.keyword) {
      updateParams({ keyword: debouncedKeyword, page: 1 });
    }
  }, [debouncedKeyword, params.keyword, updateParams]);

  // Cập nhật URL searchParams khi params thay đổi
  useEffect(() => {
    const nextParams = {};
    if (params.keyword) nextParams.keyword = params.keyword;
    if (params.categoryId) nextParams.category = params.categoryId;
    if (params.authorId) nextParams.author = params.authorId;
    if (params.publisherId) nextParams.publisher = params.publisherId;
    if (params.minPrice) nextParams.minPrice = params.minPrice;
    if (params.maxPrice) nextParams.maxPrice = params.maxPrice;
    if (params.minRating) nextParams.minRating = params.minRating;
    if (params.sort && params.sort !== 'newest') nextParams.sort = params.sort;
    if (params.page && params.page > 1) nextParams.page = params.page;

    setSearchParams(nextParams, { replace: true });
  }, [params, setSearchParams]);

  const clearFilters = () => {
    setKeyword('');
    updateParams({
      keyword: '',
      categoryId: '',
      authorId: '',
      publisherId: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sort: 'newest',
      page: 1,
    });
  };

  // Tra cứu thông tin tác giả, nhà xuất bản, thể loại đang chọn
  const activeAuthor = useMemo(() => {
    if (!params.authorId) return null;
    return authors.find((a) => String(a.id) === String(params.authorId)) || null;
  }, [authors, params.authorId]);

  const activePublisher = useMemo(() => {
    if (!params.publisherId) return null;
    return publishers.find((p) => String(p.id) === String(params.publisherId)) || null;
  }, [publishers, params.publisherId]);

  const activeCategory = useMemo(() => {
    if (!params.categoryId) return null;
    return categories.find((c) => String(c.id) === String(params.categoryId)) || null;
  }, [categories, params.categoryId]);

  const hasActiveFilters = Boolean(
    params.keyword ||
    params.categoryId ||
    params.authorId ||
    params.publisherId ||
    params.minPrice ||
    params.maxPrice ||
    params.minRating
  );

  // Tiêu đề trang động
  const pageTitle = activeCategory
    ? `Sách thể loại: ${activeCategory.name}`
    : activeAuthor
    ? `Sách của tác giả: ${activeAuthor.name}`
    : activePublisher
    ? `Sách từ NXB: ${activePublisher.name}`
    : params.keyword
    ? `Kết quả tìm kiếm: "${params.keyword}"`
    : 'Kho sách';

  return (
    <div className="page container">
      <div className="page-head">
        <div>
          <h1>{pageTitle}</h1>
          <p>
            {total > 0
              ? `Tìm thấy ${total} đầu sách phù hợp.`
              : 'Khám phá toàn bộ sách của WebYBook với nhiều thể loại và tác giả.'}
          </p>
        </div>
      </div>

      {/* Banner thông tin tác giả nếu đang lọc theo tác giả */}
      {activeAuthor ? (
        <section className="context-banner context-banner--author" aria-label="Thông tin tác giả">
          <div className="context-banner__icon">
            <User size={24} />
          </div>
          <div className="context-banner__content">
            <div className="context-banner__header">
              <span className="context-banner__badge">Tác giả</span>
              <h2>{activeAuthor.name}</h2>
            </div>
            {activeAuthor.biography || activeAuthor.bio ? (
              <p className="context-banner__desc">{activeAuthor.biography || activeAuthor.bio}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="context-banner__close"
            onClick={() => updateParams({ authorId: '', page: 1 })}
            aria-label="Bỏ chọn tác giả"
            title="Bỏ chọn tác giả"
          >
            <X size={18} />
          </button>
        </section>
      ) : null}

      {/* Banner thông tin nhà xuất bản nếu đang lọc theo NXB */}
      {activePublisher ? (
        <section className="context-banner context-banner--publisher" aria-label="Thông tin nhà xuất bản">
          <div className="context-banner__icon">
            <Building2 size={24} />
          </div>
          <div className="context-banner__content">
            <div className="context-banner__header">
              <span className="context-banner__badge">Nhà xuất bản</span>
              <h2>{activePublisher.name}</h2>
            </div>
            <div className="context-banner__meta">
              {activePublisher.address ? <span>Địa chỉ: {activePublisher.address}</span> : null}
              {activePublisher.phone ? <span>Điện thoại: {activePublisher.phone}</span> : null}
              {activePublisher.email ? <span>Email: {activePublisher.email}</span> : null}
            </div>
          </div>
          <button
            type="button"
            className="context-banner__close"
            onClick={() => updateParams({ publisherId: '', page: 1 })}
            aria-label="Bỏ chọn nhà xuất bản"
            title="Bỏ chọn nhà xuất bản"
          >
            <X size={18} />
          </button>
        </section>
      ) : null}

      {/* Banner thông tin thể loại nếu đang lọc theo thể loại */}
      {activeCategory && activeCategory.description ? (
        <section className="context-banner context-banner--category" aria-label="Thông tin thể loại">
          <div className="context-banner__icon">
            <BookOpen size={24} />
          </div>
          <div className="context-banner__content">
            <div className="context-banner__header">
              <span className="context-banner__badge">Thể loại</span>
              <h2>{activeCategory.name}</h2>
            </div>
            <p className="context-banner__desc">{activeCategory.description}</p>
          </div>
          <button
            type="button"
            className="context-banner__close"
            onClick={() => updateParams({ categoryId: '', page: 1 })}
            aria-label="Bỏ chọn thể loại"
            title="Bỏ chọn thể loại"
          >
            <X size={18} />
          </button>
        </section>
      ) : null}

      <div className="catalog-toolbar">
        <div className="catalog-toolbar__search">
          <BookSearch
            value={keyword}
            onChange={setKeyword}
            onSubmit={() => updateParams({ keyword, page: 1 })}
          />
        </div>
        <div className="catalog-toolbar__right">
          <Select
            aria-label="Sắp xếp"
            value={params.sort}
            onChange={(event) => updateParams({ sort: event.target.value, page: 1 })}
            options={BOOK_SORT_OPTIONS}
            className="catalog-toolbar__sort"
          />
          <Button
            variant="outline"
            icon={SlidersHorizontal}
            className="catalog-toolbar__filter-btn"
            onClick={() => setShowFilter((value) => !value)}
          >
            Bộ lọc {hasActiveFilters ? '•' : ''}
          </Button>
        </div>
      </div>

      {/* Thanh hiển thị các điều kiện lọc hiện tại (Active Filters Chips) */}
      {hasActiveFilters ? (
        <div className="active-filters" aria-label="Các bộ lọc đang áp dụng">
          <span className="active-filters__label">
            <Tag size={14} /> Đang lọc:
          </span>
          <div className="active-filters__list">
            {params.keyword ? (
              <span className="filter-chip">
                <span>Từ khóa: "{params.keyword}"</span>
                <button
                  type="button"
                  onClick={() => {
                    setKeyword('');
                    updateParams({ keyword: '', page: 1 });
                  }}
                  aria-label="Xóa từ khóa"
                >
                  <X size={13} />
                </button>
              </span>
            ) : null}

            {activeCategory ? (
              <span className="filter-chip">
                <span>Thể loại: {activeCategory.name}</span>
                <button
                  type="button"
                  onClick={() => updateParams({ categoryId: '', page: 1 })}
                  aria-label="Xóa thể loại"
                >
                  <X size={13} />
                </button>
              </span>
            ) : null}

            {activeAuthor ? (
              <span className="filter-chip">
                <span>Tác giả: {activeAuthor.name}</span>
                <button
                  type="button"
                  onClick={() => updateParams({ authorId: '', page: 1 })}
                  aria-label="Xóa tác giả"
                >
                  <X size={13} />
                </button>
              </span>
            ) : null}

            {activePublisher ? (
              <span className="filter-chip">
                <span>NXB: {activePublisher.name}</span>
                <button
                  type="button"
                  onClick={() => updateParams({ publisherId: '', page: 1 })}
                  aria-label="Xóa nhà xuất bản"
                >
                  <X size={13} />
                </button>
              </span>
            ) : null}

            {params.minPrice || params.maxPrice ? (
              <span className="filter-chip">
                <span>
                  Giá: {params.minPrice ? formatCurrency(params.minPrice) : '0₫'} -{' '}
                  {params.maxPrice ? formatCurrency(params.maxPrice) : 'không giới hạn'}
                </span>
                <button
                  type="button"
                  onClick={() => updateParams({ minPrice: '', maxPrice: '', page: 1 })}
                  aria-label="Xóa khoảng giá"
                >
                  <X size={13} />
                </button>
              </span>
            ) : null}

            {params.minRating ? (
              <span className="filter-chip">
                <span>Từ {params.minRating} sao</span>
                <button
                  type="button"
                  onClick={() => updateParams({ minRating: '', page: 1 })}
                  aria-label="Xóa đánh giá sao"
                >
                  <X size={13} />
                </button>
              </span>
            ) : null}

            <button
              type="button"
              className="active-filters__clear-all"
              onClick={clearFilters}
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        </div>
      ) : null}

      <div className="catalog-layout">
        <div className={`catalog-sidebar ${showFilter ? 'is-open' : ''}`}>
          <div className="catalog-sidebar__head">
            <strong>Bộ lọc sách</strong>
            <button type="button" onClick={() => setShowFilter(false)} aria-label="Đóng bộ lọc">
              <X size={18} />
            </button>
          </div>
          <BookFilter
            categories={categories}
            authors={authors}
            publishers={publishers}
            value={params}
            onChange={(patch) => {
              updateParams({ ...patch, page: 1 });
              setShowFilter(false);
            }}
            onReset={clearFilters}
          />
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
