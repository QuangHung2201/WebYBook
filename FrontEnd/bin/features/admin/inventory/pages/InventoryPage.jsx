import { useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, Boxes, RefreshCw, XCircle } from 'lucide-react';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import BookCover from '@/components/shared/BookCover/BookCover';
import StatCard from '@/features/admin/components/StatCard';
import { normalizeKeyword } from '@/shared/utils/validators';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useInventory } from '../hooks/useInventory';
import StockEditor from '../components/StockEditor';

const STOCK_FILTERS = [
  { value: 'all', label: 'Tất cả mức tồn' },
  { value: 'out', label: 'Hết hàng' },
  { value: 'low', label: 'Sắp hết (1 - 10)' },
  { value: 'ok', label: 'Đủ hàng (> 10)' },
];

const priceOf = (book) =>
  Number(book.discountPrice) > 0 && Number(book.discountPrice) < Number(book.price)
    ? Number(book.discountPrice)
    : Number(book.price);

export default function InventoryPage() {
  const { books, loading, error, updatingId, refresh, setStock } = useInventory();
  const [keyword, setKeyword] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  const stats = useMemo(() => {
    const totalStock = books.reduce((sum, book) => sum + (Number(book.stock) || 0), 0);
    return {
      titles: books.length,
      totalStock,
      lowStock: books.filter((book) => {
        const stock = Number(book.stock) || 0;
        return stock > 0 && stock <= 10;
      }).length,
      outOfStock: books.filter((book) => (Number(book.stock) || 0) === 0).length,
    };
  }, [books]);

  const filtered = useMemo(() => {
    const needle = normalizeKeyword(keyword);
    return books.filter((book) => {
      const stock = Number(book.stock) || 0;
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'out' && stock === 0) ||
        (stockFilter === 'low' && stock > 0 && stock <= 10) ||
        (stockFilter === 'ok' && stock > 10);
      const matchesKeyword =
        !needle ||
        [book.title, book.author?.name, book.category?.name]
          .map(normalizeKeyword)
          .some((value) => value.includes(needle));
      return matchesStock && matchesKeyword;
    });
  }, [books, keyword, stockFilter]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Tồn kho</h2>
          <p>Theo dõi và điều chỉnh số lượng sách còn trong kho theo thời gian thực.</p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={refresh} loading={loading}>
          Làm mới
        </Button>
      </div>

      <div className="stat-grid">
        <StatCard label="Đầu sách" value={stats.titles} icon={BookOpen} tone="info" />
        <StatCard label="Tổng tồn kho" value={stats.totalStock.toLocaleString('vi-VN')} icon={Boxes} tone="success" />
        <StatCard label="Sắp hết hàng" value={stats.lowStock} icon={AlertTriangle} tone="warning" meta="Còn từ 1 đến 10 cuốn" />
        <StatCard label="Hết hàng" value={stats.outOfStock} icon={XCircle} tone="danger" meta="Cần nhập thêm sách" />
      </div>

      <div className="admin-filters">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="Tìm theo tên sách, tác giả..."
        />
        <Select
          aria-label="Lọc theo mức tồn"
          value={stockFilter}
          onChange={(event) => setStockFilter(event.target.value)}
          options={STOCK_FILTERS}
        />
        <span className="admin-count">{filtered.length} đầu sách</span>
      </div>

      {loading ? (
        <Loading label="Đang tải dữ liệu tồn kho..." />
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
                  <th>Điều chỉnh tồn kho</th>
                  <th>Mức tồn</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        title="Không có sách phù hợp"
                        description="Thử đổi từ khóa hoặc mức tồn đang lọc."
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((book) => {
                    const stock = Number(book.stock) || 0;
                    const percent = Math.min(100, Math.round((stock / 50) * 100));
                    const tone = stock === 0 ? 'out' : stock <= 10 ? 'low' : 'ok';
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
                          <StockEditor
                            value={stock}
                            disabled={String(updatingId) === String(book.id)}
                            onChange={(next) => setStock(book, next)}
                          />
                        </td>
                        <td>
                          <div className="admin-stock-bar">
                            <span className="admin-stock-bar__track">
                              <span
                                className={`admin-stock-bar__fill ${
                                  tone === 'out'
                                    ? 'admin-stock-bar__fill--out'
                                    : tone === 'low'
                                      ? 'admin-stock-bar__fill--low'
                                      : ''
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </span>
                            <span>{stock} cuốn</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="admin-form-note">
        Thay đổi tồn kho được lưu ngay lập tức. Khi kết nối API, thao tác này sẽ gọi endpoint cập
        nhật tồn kho của máy chủ thay vì lưu cục bộ.
      </p>
    </div>
  );
}
