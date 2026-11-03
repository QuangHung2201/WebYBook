import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import BookCover from '@/components/shared/BookCover/BookCover';
import PriceDisplay from '@/components/shared/PriceDisplay/PriceDisplay';
import { formatCurrency } from '@/shared/utils/formatCurrency';

export default function CartItem({ item, onUpdateQty, onRemove }) {
  const { book, qty } = item;
  const unitPrice = Number(book.discountPrice) || Number(book.price) || 0;

  return (
    <div className="cart-item">
      <Link to={`/books/${book.id}`} className="cart-item__cover">
        <BookCover title={book.title} author={book.author?.name} coverImage={book.coverImage} />
      </Link>

      <div className="cart-item__info">
        <span className="cart-item__category">{book.category?.name}</span>
        <h3 className="cart-item__title">
          <Link to={`/books/${book.id}`}>{book.title}</Link>
        </h3>
        <p className="cart-item__author">{book.author?.name}</p>
        <span className="cart-item__stock">Còn {book.stock} cuốn</span>
      </div>

      <div className="cart-item__price">
        <PriceDisplay price={book.price} discountPrice={book.discountPrice} size="sm" showBadge={false} />
      </div>

      <div className="qty-stepper" aria-label="Số lượng">
        <button
          type="button"
          onClick={() => onUpdateQty(book.id, qty - 1)}
          disabled={qty <= 1}
          aria-label="Giảm số lượng"
        >
          <Minus size={14} />
        </button>
        <span>{qty}</span>
        <button
          type="button"
          onClick={() => onUpdateQty(book.id, qty + 1)}
          disabled={qty >= book.stock}
          aria-label="Tăng số lượng"
        >
          <Plus size={14} />
        </button>
      </div>

      <span className="cart-item__total">{formatCurrency(unitPrice * qty)}</span>

      <button
        type="button"
        className="cart-item__remove"
        onClick={() => onRemove(book.id)}
        aria-label={`Xóa ${book.title} khỏi giỏ`}
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}
