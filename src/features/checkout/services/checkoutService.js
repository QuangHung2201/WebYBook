import { orderService } from '@/features/orders/services/orderService';
import { bookService } from '@/features/books/services/bookService';
import { getShippingFee } from '@/data/constants/shippingMethods';
import { isMockDataSource } from '@/infrastructure/config/environment';

/**
 * Checkout use case: turns cart + form + voucher into an order.
 * Orchestrates order creation and stock updates so UI never does business math.
 */
export const checkoutService = {
  calculateTotals({ subtotal, shippingMethod, discount = 0 }) {
    const shippingFee = getShippingFee(shippingMethod, subtotal);
    const total = Math.max(0, Number(subtotal) + shippingFee - Number(discount));
    return { shippingFee, total };
  },

  async placeOrder({ user, form, cart, voucher, shippingMethod, paymentMethod }) {
    if (!user) throw new Error('Vui lòng đăng nhập để đặt hàng.');
    if (!cart?.items?.length) throw new Error('Giỏ hàng của bạn đang trống.');

    const subtotal = Number(cart.subtotal) || 0;
    const { shippingFee, total } = this.calculateTotals({
      subtotal,
      shippingMethod,
      discount: voucher?.discount || 0,
    });

    const payload = {
      userId: user.id,
      customerName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      note: form.note?.trim() || '',
      paymentMethod,
      shippingMethod,
      voucherCode: voucher?.voucher?.code || '',
      subtotal,
      shippingFee,
      discount: Number(voucher?.discount) || 0,
      total,
      items: cart.items.map((item) => ({
        bookId: item.book.id,
        title: item.book.title,
        coverImage: item.book.coverImage || '',
        price: Number(item.book.discountPrice) || Number(item.book.price) || 0,
        qty: item.qty,
      })),
    };

    const order = await orderService.createOrder(payload);

    // Mock backend: adjust stock locally. The API repository is a no-op here
    // because the Spring Boot order service owns stock updates.
    if (isMockDataSource()) {
      await Promise.all(
        cart.items.map((item) => bookService.updateStock(item.book.id, -item.qty)),
      );
    }

    return order;
  },
};
