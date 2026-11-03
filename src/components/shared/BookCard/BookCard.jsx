import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import BookCover from '../BookCover/BookCover';
import PriceDisplay from '../PriceDisplay/PriceDisplay';
import RatingStars from '../RatingStars/RatingStars';
import { calcDiscountPercent } from '../../../shared/utils/formatCurrency';
import './BookCard.css';

export default function BookCard({ book, onAddToCart }) {
  const inStock = Number(book.stock) > 0;
  const discount = calcDiscountPercent(book.price, book.discountPrice);

  return (
    <article className="book-card">
      <Link to={`/books/${book.id}`} className="book-card__media" aria-label={`Xem chi tiết ${book.title}`}>
        <BookCover title={book.title} author={book.author?.name} coverImage={book.coverImage} />
        {discount > 0 ? <span className="book-card__badge">-{discount}%</span> : null}
        {!inStock ? <span className="book-card__soldout">Hết hàng</span> : null}
      </Link>

      <div className="book-card__body">
        <span className="book-card__category">{book.category?.name || 'Sách'}</span>
        <h3 className="book-card__title">
          <Link to={`/books/${book.id}`}>{book.title}</Link>
        </h3>
        <p className="book-card__author">{book.author?.name || 'Đang cập nhật'}</p>

        <div className="book-card__rating">
          <RatingStars rating={book.rating} count={book.reviewCount} />
        </div>

        <div className="book-card__footer">
          <PriceDisplay price={book.price} discountPrice={book.discountPrice} size="md" />
          <button
            type="button"
            className="book-card__add"
            onClick={() => onAddToCart?.(book)}
            disabled={!inStock}
            aria-label={inStock ? `Thêm ${book.title} vào giỏ` : 'Sách đã hết hàng'}
            title={inStock ? 'Thêm vào giỏ hàng' : 'Sách đã hết hàng'}
          >
            <ShoppingCart size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
