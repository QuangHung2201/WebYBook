import { useEffect } from 'react';
import { useToast } from '@/app/providers/ToastProvider';
import { useCartStore } from '../store/cartStore';

export function useCart() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const count = useCartStore((state) => state.count);
  const loading = useCartStore((state) => state.loading);
  const initialized = useCartStore((state) => state.initialized);
  const error = useCartStore((state) => state.error);

  const fetchCart = useCartStore((state) => state.fetchCart);
  const addItem = useCartStore((state) => state.addItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);

  const toast = useToast();

  useEffect(() => {
    if (!initialized && !loading) fetchCart();
  }, [initialized, loading, fetchCart]);

  const addToCart = async (book, qty = 1) => {
    try {
      await addItem(book, qty);
      toast.success(`Đã thêm "${book.title}" vào giỏ hàng.`);
      return true;
    } catch (err) {
      toast.error(err.message || 'Không thể thêm vào giỏ hàng.');
      return false;
    }
  };

  const updateQuantity = async (bookId, qty) => {
    try {
      await updateItem(bookId, qty);
    } catch (err) {
      toast.error(err.message || 'Không thể cập nhật số lượng.');
    }
  };

  const removeFromCart = async (bookId) => {
    try {
      await removeItem(bookId);
      toast.success('Đã xóa sách khỏi giỏ hàng.');
    } catch (err) {
      toast.error(err.message || 'Không thể xóa sách khỏi giỏ hàng.');
    }
  };

  const clearCart = async () => {
    try {
      await clear();
    } catch (err) {
      toast.error(err.message || 'Không thể xóa giỏ hàng.');
    }
  };

  return {
    items,
    subtotal,
    count,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refresh: fetchCart,
  };
}
