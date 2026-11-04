import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import BookCover from '@/components/shared/BookCover/BookCover';

export default function TopBooksCard({ books = [] }) {
  return (
    <section className="admin-chart-card">
      <div className="admin-chart-card__head">
        <div>
          <h3>Sách bán chạy</h3>
          <p>Xếp theo số lượng đã bán</p>
        </div>
        <Link to="/admin/books" className="link">
          Quản lý <ArrowRight size={14} />
        </Link>
      </div>
      {books.length === 0 ? (
        <div className="chart-empty">Chưa có dữ liệu sách.</div>
      ) : (
        <div className="admin-list">
          {books.map((book, index) => (
            <div key={book.id} className="admin-list__item">
              <span className={`admin-list__rank ${index < 3 ? 'admin-list__rank--top' : ''}`}>
                {index + 1}
              </span>
              <span className="admin-list__thumb">
                <BookCover
                  title={book.title}
                  author={book.author?.name}
                  coverImage={book.coverImage}
                />
              </span>
              <div className="admin-list__body">
                <strong>{book.title}</strong>
                <span>{book.author?.name || 'Chưa rõ tác giả'}</span>
              </div>
              <span className="admin-list__value">
                {Number(book.sold).toLocaleString('vi-VN')}
                <small>đã bán</small>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
