import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog/ConfirmDialog';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge/StatusBadge';
import BookCover from '@/components/shared/BookCover/BookCover';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { BOOK_STATUS, BOOK_STATUS_LABELS, BOOK_STATUS_OPTIONS } from '@/data/constants/bookStatus';
import { useAdminBooks } from '../hooks/useAdminBooks';
import BookFormModal from '../components/BookFormModal';

const STATUS_FILTERS = [{ value: '', label: 'Tất cả trạng thái' }, ...BOOK_STATUS_OPTIONS];

const priceOf = (book) =>
  Number(book.discountPrice) > 0 && Number(book.discountPrice) < Number(book.price)
    ? Number(book.discountPrice)
    : Number(book.price);

export default function AdminBooksPage() {
  const {
    books,
    total,
    page,
    totalPages,
    params,
    loading,
    saving,
    error,
    lookups,
    categoryOptions,
    updateParams,
    setPage,
    refresh,
    createBook,
    updateBook,
    deleteBook,
  } = useAdminBooks();

  const [keyword, setKeyword] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const debouncedKeyword = useDebounce(keyword, 350);

  useEffect(() => {
    if (debouncedKeyword !== params.keyword) updateParams({ keyword: debouncedKeyword });
  }, [debouncedKeyword, params.keyword, updateParams]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (book) => {
    setEditing(book);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = (values) =>
    editing ? updateBook(editing.id, values) : createBook(values);

  const handleDelete = async () => {
    if (!deleting) return;
    const ok = await deleteBook(deleting.id);
    if (ok) setDeleting(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Quản lý sách</h2>
          <p>Thêm mới, chỉnh sửa thông tin và trạng thái kinh doanh của từng đầu sách.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          Thêm sách
        </Button>
      </div>

      <div className="admin-filters">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          onSubmit={(value) => updateParams({ keyword: value })}
          placeholder="Tìm theo tên sách, tác giả..."
        />
        <Select
          aria-label="Lọc theo danh mục"
          value={params.categoryId}
          onChange={(event) => updateParams({ categoryId: event.target.value })}
          options={[{ value: '', label: 'Tất cả danh mục' }, ...categoryOptions]}
        />
        <Select
          aria-label="Lọc theo trạng thái"
          value={params.status}
          onChange={(event) => updateParams({ status: event.target.value })}
          options={STATUS_FILTERS}
        />
        <span className="admin-count">{total} đầu sách</span>
      </div>

      {loading ? (
        <Loading label="Đang tải danh sách sách..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <div className="admin-table-card">
          <div className="table-wrap admin-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sách</th>
                  <th>Danh mục</th>
                  <th>Giá bán</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {books.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        title="Không tìm thấy sách"
                        description="Thử đổi từ khóa hoặc bộ lọc, hoặc thêm một đầu sách mới."
                        action={<Button icon={Plus} onClick={openCreate}>Thêm sách</Button>}
                      />
                    </td>
                  </tr>
                ) : (
                  books.map((book) => {
                    const stock = Number(book.stock) || 0;
                    return (
                      <tr key={book.id}>
                        <td>
                          <div className="admin-table-book">
                            <span className="admin-table-thumb">
                              <BookCover
                                title={book.title}
                                author={book.author?.name}
                                coverImage={book.coverImage}
                              />
                            </span>
                            <div className="admin-table-book__info">
                              <strong>{book.title}</strong>
                              <span>{book.author?.name || 'Chưa rõ tác giả'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="muted">{book.category?.name || '—'}</td>
                        <td className="admin-money">{formatCurrency(priceOf(book))}</td>
                        <td>
                          <span
                            className={`admin-stock ${
                              stock === 0
                                ? 'admin-stock--out'
                                : stock <= 10
                                  ? 'admin-stock--low'
                                  : 'admin-stock--ok'
                            }`}
                          >
                            {stock}
                          </span>
                        </td>
                        <td>
                          <StatusBadge
                            tone={book.status === BOOK_STATUS.ACTIVE ? 'success' : 'neutral'}
                          >
                            {BOOK_STATUS_LABELS[book.status] || book.status}
                          </StatusBadge>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <button
                              type="button"
                              className="admin-action-btn"
                              onClick={() => openEdit(book)}
                              aria-label={`Sửa ${book.title}`}
                              title="Chỉnh sửa"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--danger"
                              onClick={() => setDeleting(book)}
                              aria-label={`Xóa ${book.title}`}
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} className="admin-pagination" />
        </div>
      )}

      <BookFormModal
        open={formOpen}
        book={editing}
        lookups={lookups}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa sách"
        message={`Bạn có chắc muốn xóa "${deleting?.title || ''}"? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa sách"
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
