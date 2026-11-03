import { useNavigate } from 'react-router-dom';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import CartEmpty from '../components/CartEmpty';
import './CartPage.css';

export default function CartPage() {
  const { items, subtotal, count, loading, error, updateQuantity, removeFromCart, refresh } = useCart();
  const navigate = useNavigate();

  return (
    <div className="page container">
      <div className="page-head">
        <div>
          <h1>Giỏ hàng</h1>
          <p>{count > 0 ? `Bạn đang có ${count} sản phẩm trong giỏ.` : 'Chưa có sản phẩm nào.'}</p>
        </div>
      </div>

      {loading ? (
        <Loading label="Đang tải giỏ hàng..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : items.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <CartItem
                key={item.book.id}
                item={item}
                onUpdateQty={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          <CartSummary
            subtotal={subtotal}
            count={count}
            onCheckout={() => navigate('/checkout')}
          />
        </div>
      )}
    </div>
  );
}
