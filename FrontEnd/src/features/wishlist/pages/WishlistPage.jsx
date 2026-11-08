import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import Button from '@/components/common/Button/Button';
import BookCover from '@/components/shared/BookCover/BookCover';
import PriceDisplay from '@/components/shared/PriceDisplay/PriceDisplay';
import RatingStars from '@/components/shared/RatingStars/RatingStars';
import { useCart } from '@/features/cart/hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import './Wishlist.css';

export default function WishlistPage() {
  const { items, loading, error, isPending, removeFromWishlist, reload } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="page container">
      <div className="page-head">
        <div>
          <h1>Sách yêu thích</h1>
          <p>
            {items.length > 0
              ? `Bạn đã lưu ${items.length} cuốn sách.`
              : 'Lưu lại những cuốn sách bạn muốn đọc sau.'}
          </p>
        </div>
      </div>

      {loading ? (
        <Loading label="Đang tải danh sách yêu thích..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Danh sách yêu thích đang trống"
          description="Nhấn vào biểu tượng trái tim ở trang chi tiết sách để lưu sách vào đây."
          action={
            <Link to="/books" className="btn btn--primary btn--sm">
              Khám phá kho sách
            </Link>
          }
        />
      ) : (
        <div className="wishlist-grid">
          {items.map((book) => {
            const available = book.status === 'ACTIVE' && Number(book.stock) > 0;
            return (
            <article key={book.id} className="wishlist-card">
              <Link
                to={`/books/${book.id}`}
                className="wishlist-card__media"
                aria-label={`Xem chi tiết ${book.title}`}
              >
                <BookCover
                  title={book.title}
                  author={book.author?.name}
                  coverImage={book.coverImage}
                />
              </Link>

              <div className="wishlist-card__body">
                <span className="wishlist-card__category">{book.category?.name || 'Sách'}</span>
                <h3 className="wishlist-card__title">
                  <Link to={`/books/${book.id}`}>{book.title}</Link>
                </h3>
                <p className="wishlist-card__author">{book.author?.name || 'Đang cập nhật'}</p>
                <RatingStars rating={book.rating} count={book.reviewCount} />
                <PriceDisplay price={book.price} discountPrice={book.discountPrice} size="md" />
                <span className={`wishlist-card__availability${available ? '' : ' is-unavailable'}`}>
                  {book.status !== 'ACTIVE' ? 'Ngừng kinh doanh' : available ? `Còn ${book.stock} cuốn` : 'Hết hàng'}
                </span>

                <div className="wishlist-card__actions">
                  <Button
                    size="sm"
                    icon={ShoppingCart}
                    onClick={() => addToCart(book)}
                    disabled={!available}
                  >
                    {available ? 'Thêm vào giỏ' : 'Không thể thêm vào giỏ'}
                  </Button>
                  <button
                    type="button"
                    className="wishlist-card__remove"
                    onClick={() => removeFromWishlist(book.id)}
                    disabled={isPending(book.id)}
                    aria-label={`Xóa ${book.title} khỏi danh sách yêu thích`}
                    title="Xóa khỏi danh sách yêu thích"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
