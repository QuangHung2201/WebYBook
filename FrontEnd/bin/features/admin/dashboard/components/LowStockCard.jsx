import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import BookCover from '@/components/shared/BookCover/BookCover';
import StatusBadge from '@/components/shared/StatusBadge/StatusBadge';

export default function LowStockCard({ books = [] }) {
  return (
    <section className="admin-chart-card">
      <div className="admin-chart-card__head">
        <div>
          <h3>Sắp hết hàng</h3>
          <p>Các đầu sách có tồn kho thấp</p>
        </div>
        <Link to="/admin/inventory" className="link">
          Tồn kho <ArrowRight size={14} />
        </Link>
      </div>
      {books.length === 0 ? (
        <div className="chart-empty">Tất cả đầu sách đều đủ hàng.</div>
      ) : (
        <div className="admin-list">
          {books.map((book) => {
            const stock = Number(book.stock) || 0;
            return (
              <div key={book.id} className="admin-list__item">
                <span className="admin-list__thumb">
                  <BookCover
                    title={book.title}
                    author={book.author?.name}
                    coverImage={book.coverImage}
                  />
                </span>
                <div className="admin-list__body">
                  <strong>{book.title}</strong>
                  <span>{book.category?.name || 'Chưa phân loại'}</span>
                </div>
                <StatusBadge tone={stock === 0 ? 'danger' : 'warning'}>
                  <AlertTriangle size={12} /> {stock === 0 ? 'Hết hàng' : `Còn ${stock}`}
                </StatusBadge>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
