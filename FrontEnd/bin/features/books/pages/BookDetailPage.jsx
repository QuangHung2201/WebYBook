import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Star } from 'lucide-react';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCart } from '@/features/cart/hooks/useCart';
import { useReviews } from '@/features/reviews/hooks/useReviews';
import ReviewForm from '@/features/reviews/components/ReviewForm';
import ReviewList from '@/features/reviews/components/ReviewList';
import '@/features/reviews/Reviews.css';
import { useBookDetail } from '../hooks/useBookDetail';
import BookInformation from '../components/BookInformation';
import RelatedBooks from '../components/RelatedBooks';
import './Books.css';

export default function BookDetailPage() {
  const { id } = useParams();
  const { book, relatedBooks, loading, error, refresh } = useBookDetail(id);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const reviews = useReviews(id);
  const [tab, setTab] = useState('description');

  if (loading) {
    return (
      <div className="page container">
        <Loading fullScreen label="Đang tải thông tin sách..." />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="page container">
        <ErrorState title="Không thể tải sách" message={error || 'Sách không tồn tại.'} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="page container">
      <nav className="breadcrumb" aria-label="Đường dẫn">
        <Link to="/">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to="/books">Kho sách</Link>
        <ChevronRight size={14} />
        <span>{book.title}</span>
      </nav>

      <BookInformation book={book} onAddToCart={addToCart} />

      <div className="book-detail__tabs">
        <button
          type="button"
          className={tab === 'description' ? 'is-active' : ''}
          onClick={() => setTab('description')}
        >
          Mô tả sách
        </button>
        <button
          type="button"
          className={tab === 'reviews' ? 'is-active' : ''}
          onClick={() => setTab('reviews')}
        >
          <Star size={15} /> Đánh giá ({book.reviewCount})
        </button>
      </div>

      <section className="panel book-detail__panel">
        {tab === 'description' ? (
          <div className="book-description">
            <h3>Giới thiệu về cuốn sách</h3>
            <p>{book.description}</p>
            <ul className="book-description__meta">
              <li>
                <span>Tác giả</span>
                <strong>{book.author?.name}</strong>
              </li>
              <li>
                <span>Thể loại</span>
                <strong>{book.category?.name}</strong>
              </li>
              <li>
                <span>Nhà xuất bản</span>
                <strong>{book.publisher?.name}</strong>
              </li>
              <li>
                <span>Tồn kho</span>
                <strong>{book.stock} cuốn</strong>
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <h3 className="book-detail__reviews-title">Đánh giá từ độc giả</h3>
            <ReviewForm submitting={reviews.submitting} onSubmit={(data) => reviews.submitReview(user, data)} />
            <ReviewList
              reviews={reviews.reviews}
              loading={reviews.loading}
              currentUser={user}
              onRemove={(reviewId) => reviews.removeReview(user, reviewId)}
            />
          </div>
        )}
      </section>

      <RelatedBooks books={relatedBooks} onAddToCart={addToCart} />
    </div>
  );
}
