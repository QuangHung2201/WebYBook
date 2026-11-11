import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Star } from 'lucide-react';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import Button from '@/components/common/Button/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog/ConfirmDialog';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCart } from '@/features/cart/hooks/useCart';
import { useReviews } from '@/features/reviews/hooks/useReviews';
import ReviewForm from '@/features/reviews/components/ReviewForm';
import ReviewList from '@/features/reviews/components/ReviewList';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { formatDate } from '@/shared/utils/formatDate';
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
  const wishlist = useWishlist();
  const [tab, setTab] = useState('description');
  const [reviewToRemove, setReviewToRemove] = useState(null);
  const [removingReview, setRemovingReview] = useState(false);

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
        <ErrorState
          title="Không tìm thấy sách"
          message={error || 'Cuốn sách này không tồn tại hoặc đã ngừng kinh doanh.'}
          action={
            <Link to="/books">
              <Button>Quay lại kho sách</Button>
            </Link>
          }
          onRetry={refresh}
        />
      </div>
    );
  }

  const handleSubmitReview = async (data) => {
    const success = await reviews.submitReview(user, data);
    if (success) refresh();
    return success;
  };

  const confirmRemoveReview = async () => {
    if (reviewToRemove === null) return;
    setRemovingReview(true);
    const removed = await reviews.removeReview(user, reviewToRemove);
    if (removed) setReviewToRemove(null);
    setRemovingReview(false);
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.reviews.filter((review) => Number(review.rating) === rating).length,
  }));

  return (
    <div className="page container">
      <nav className="breadcrumb" aria-label="Đường dẫn">
        <Link to="/">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to="/books">Kho sách</Link>
        <ChevronRight size={14} />
        <span>{book.title}</span>
      </nav>

      <BookInformation
        book={book}
        onAddToCart={addToCart}
        wishlisted={wishlist.isWishlisted(book.id)}
        wishlistPending={wishlist.isPending(book.id)}
        onToggleWishlist={wishlist.toggleWishlist}
      />

      <div className="book-detail__tabs">
        <button
          type="button"
          className={tab === 'description' ? 'is-active' : ''}
          onClick={() => setTab('description')}
        >
          Mô tả sách
        </button>
        {book.tableOfContents ? (
          <button
            type="button"
            className={tab === 'contents' ? 'is-active' : ''}
            onClick={() => setTab('contents')}
          >
            Mục lục
          </button>
        ) : null}
        {book.previewContent ? (
          <button
            type="button"
            className={tab === 'preview' ? 'is-active' : ''}
            onClick={() => setTab('preview')}
          >
            Đọc thử
          </button>
        ) : null}
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
                <strong>
                  {book.author?.id ? (
                    <Link to={`/books?author=${book.author.id}`} className="link">
                      {book.author?.name}
                    </Link>
                  ) : (
                    book.author?.name || 'Đang cập nhật'
                  )}
                </strong>
              </li>
              <li>
                <span>Thể loại</span>
                <strong>
                  {book.category?.id ? (
                    <Link to={`/books?category=${book.category.id}`} className="link">
                      {book.category?.name}
                    </Link>
                  ) : (
                    book.category?.name || 'Đang cập nhật'
                  )}
                </strong>
              </li>
              <li>
                <span>Nhà xuất bản</span>
                <strong>
                  {book.publisher?.id ? (
                    <Link to={`/books?publisher=${book.publisher.id}`} className="link">
                      {book.publisher?.name}
                    </Link>
                  ) : (
                    book.publisher?.name || 'Đang cập nhật'
                  )}
                </strong>
              </li>
              {book.pageCount ? (
                <li>
                  <span>Số trang</span>
                  <strong>{book.pageCount}</strong>
                </li>
              ) : null}
              {book.createdAt ? (
                <li>
                  <span>Ngày xuất bản</span>
                  <strong>{formatDate(book.createdAt)}</strong>
                </li>
              ) : null}
              {book.isbn ? (
                <li>
                  <span>Mã ISBN</span>
                  <strong>{book.isbn}</strong>
                </li>
              ) : null}
              <li>
                <span>Tồn kho</span>
                <strong>{book.stock} cuốn</strong>
              </li>
            </ul>
            {book.publisher?.address || book.publisher?.phone || book.publisher?.email ? (
              <div className="book-publisher">
                <h4>Thông tin nhà xuất bản</h4>
                {book.publisher.address ? <p>Địa chỉ: {book.publisher.address}</p> : null}
                {book.publisher.phone ? <p>Điện thoại: {book.publisher.phone}</p> : null}
                {book.publisher.email ? <p>Email: {book.publisher.email}</p> : null}
              </div>
            ) : null}
          </div>
        ) : tab === 'contents' ? (
          <div className="book-description">
            <h3>Mục lục</h3>
            <div className="book-toc">{book.tableOfContents}</div>
          </div>
        ) : tab === 'preview' ? (
          <div className="book-description">
            <h3>Đọc thử</h3>
            <div className="book-preview__content">{book.previewContent}</div>
            {book.previewPageCount ? (
              <p className="muted">Trích trước {book.previewPageCount} trang từ cuốn sách.</p>
            ) : null}
          </div>
        ) : (
          <div id="reviews">
            <h3 className="book-detail__reviews-title">Đánh giá từ độc giả</h3>
            <div className="review-summary" aria-label="Tổng hợp đánh giá">
              <strong>{Number(book.rating || 0).toFixed(1)} / 5</strong>
              <span>{book.reviewCount || 0} lượt đánh giá đã được duyệt</span>
              {!reviews.loading && !reviews.error ? ratingDistribution.map(({ rating, count }) => (
                <span key={rating}>{rating} sao: {count}</span>
              )) : null}
            </div>
            <ReviewForm
              submitting={reviews.submitting}
              myReview={reviews.myReview}
              onSubmit={handleSubmitReview}
            />
            {reviews.error ? (
              <div role="alert" className="review-load-error">
                <p>{reviews.error}</p>
                <Button variant="outline" size="sm" onClick={reviews.refresh}>Thử tải lại</Button>
              </div>
            ) : (
              <ReviewList
                reviews={reviews.reviews}
                loading={reviews.loading}
                currentUser={user}
                onRemove={setReviewToRemove}
              />
            )}
          </div>
        )}
      </section>

      <RelatedBooks books={relatedBooks} onAddToCart={addToCart} />
      <ConfirmDialog
        open={reviewToRemove !== null}
        title="Xóa đánh giá"
        message="Bạn có chắc chắn muốn xóa đánh giá này? Thao tác này không thể hoàn tác."
        confirmLabel="Xóa đánh giá"
        loading={removingReview}
        onConfirm={confirmRemoveReview}
        onCancel={() => { if (!removingReview) setReviewToRemove(null); }}
      />
    </div>
  );
}
