import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Check, Heart, Minus, Plus, ShoppingCart, Truck } from 'lucide-react';
import BookCover from '@/components/shared/BookCover/BookCover';
import PriceDisplay from '@/components/shared/PriceDisplay/PriceDisplay';
import RatingStars from '@/components/shared/RatingStars/RatingStars';
import Button from '@/components/common/Button/Button';
import { formatDate } from '@/shared/utils/formatDate';

export default function BookInformation({
  book,
  onAddToCart,
  wishlisted = false,
  wishlistPending = false,
  onToggleWishlist,
}) {
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();
  const inStock = Number(book.stock) > 0;

  const changeQty = (delta) => {
    setQty((current) => Math.max(1, Math.min(current + delta, Number(book.stock) || 1)));
  };

  const handleBuyNow = async () => {
    const success = await onAddToCart(book, qty);
    if (success) navigate('/checkout');
  };

  return (
    <div className="book-info">
      <div className="book-info__cover">
        <BookCover title={book.title} author={book.author?.name} coverImage={book.coverImage} eager />
      </div>

      <div className="book-info__body">
        {book.category?.id ? (
          <Link to={`/books?category=${book.category.id}`} className="book-info__category">
            {book.category.name}
          </Link>
        ) : (
          <span className="book-info__category">{book.category?.name || 'Sách'}</span>
        )}

        <h1 className="book-info__title">{book.title}</h1>

        <div className="book-info__meta">
          <span>
            Tác giả:{' '}
            <strong>
              {book.author?.id ? (
                <Link to={`/books?author=${book.author.id}`} className="link">
                  {book.author.name}
                </Link>
              ) : (
                book.author?.name || 'Đang cập nhật'
              )}
            </strong>
          </span>
          <span>
            Nhà xuất bản:{' '}
            <strong>
              {book.publisher?.id ? (
                <Link to={`/books?publisher=${book.publisher.id}`} className="link">
                  {book.publisher.name}
                </Link>
              ) : (
                book.publisher?.name || 'Đang cập nhật'
              )}
            </strong>
          </span>
          {book.pageCount ? (
            <span>
              Số trang: <strong>{book.pageCount}</strong>
            </span>
          ) : null}
          {book.createdAt ? (
            <span>
              Ngày xuất bản: <strong>{formatDate(book.createdAt)}</strong>
            </span>
          ) : null}
          {book.isbn ? (
            <span>
              ISBN: <strong>{book.isbn}</strong>
            </span>
          ) : null}
        </div>

        <div className="book-info__rating">
          <RatingStars rating={book.rating} size={17} showValue count={book.reviewCount} />
          <span className="book-info__sold">Đã bán {book.sold}</span>
        </div>

        <div className="book-info__price">
          <PriceDisplay price={book.price} discountPrice={book.discountPrice} size="lg" />
        </div>

        <div className="book-info__stock">
          {inStock ? (
            <span className="text-success">
              <Check size={15} /> Còn {book.stock} cuốn trong kho
            </span>
          ) : (
            <span className="text-danger">Tạm hết hàng</span>
          )}
        </div>

        <div className="book-info__actions">
          <div className="qty-stepper">
            <button type="button" onClick={() => changeQty(-1)} disabled={qty <= 1} aria-label="Giảm">
              <Minus size={15} />
            </button>
            <span>{qty}</span>
            <button
              type="button"
              onClick={() => changeQty(1)}
              disabled={qty >= book.stock}
              aria-label="Tăng"
            >
              <Plus size={15} />
            </button>
          </div>

          <Button
            icon={ShoppingCart}
            onClick={() => onAddToCart(book, qty)}
            disabled={!inStock}
          >
            Thêm vào giỏ
          </Button>
          <Button variant="secondary" icon={BookOpen} onClick={handleBuyNow} disabled={!inStock}>
            Mua ngay
          </Button>
          {onToggleWishlist ? (
            <Button
              variant="outline"
              icon={Heart}
              onClick={() => onToggleWishlist(book)}
              loading={wishlistPending}
              aria-pressed={wishlisted}
              title={wishlisted ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
            >
              {wishlisted ? 'Đã yêu thích' : 'Yêu thích'}
            </Button>
          ) : null}
        </div>

        <div className="book-info__perks">
          <span>
            <Truck size={16} /> Miễn phí vận chuyển cho đơn từ 500.000₫
          </span>
          <span>
            <Check size={16} /> Đổi trả trong 7 ngày nếu sách lỗi
          </span>
        </div>
      </div>
    </div>
  );
}
