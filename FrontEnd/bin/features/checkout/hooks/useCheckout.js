import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCart } from '@/features/cart/hooks/useCart';
import { useToast } from '@/app/providers/ToastProvider';
import { SHIPPING_METHODS, getShippingFee } from '@/data/constants/shippingMethods';
import { PAYMENT_METHODS } from '@/data/constants/paymentMethods';
import { voucherService } from '@/features/vouchers/services/voucherService';
import { checkoutService } from '../services/checkoutService';

export function useCheckout() {
  const { user } = useAuth();
  const cart = useCart();
  const toast = useToast();

  const [shippingMethod, setShippingMethod] = useState(SHIPPING_METHODS.STANDARD);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.COD);
  const [voucher, setVoucher] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [placing, setPlacing] = useState(false);

  const shippingFee = getShippingFee(shippingMethod, cart.subtotal);
  const discount = voucher?.discount || 0;
  const total = Math.max(0, cart.subtotal + shippingFee - discount);

  const applyVoucher = async (code) => {
    if (!code?.trim()) {
      toast.error('Vui lòng nhập mã giảm giá.');
      return null;
    }
    setVoucherLoading(true);
    try {
      const result = await voucherService.validateVoucher(code, cart.subtotal);
      setVoucher(result);
      toast.success(`Đã áp dụng mã ${result.voucher.code}.`);
      return result;
    } catch (error) {
      toast.error(error.message || 'Mã giảm giá không hợp lệ.');
      return null;
    } finally {
      setVoucherLoading(false);
    }
  };

  const removeVoucher = () => setVoucher(null);

  const placeOrder = async (form) => {
    setPlacing(true);
    try {
      const order = await checkoutService.placeOrder({
        user,
        form,
        cart,
        voucher,
        shippingMethod,
        paymentMethod,
      });
      await cart.clearCart();
      toast.success('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
      return order;
    } catch (error) {
      toast.error(error.message || 'Không thể đặt hàng. Vui lòng thử lại.');
      return null;
    } finally {
      setPlacing(false);
    }
  };

  return {
    user,
    cart,
    shippingMethod,
    setShippingMethod,
    paymentMethod,
    setPaymentMethod,
    voucher,
    voucherLoading,
    applyVoucher,
    removeVoucher,
    shippingFee,
    discount,
    total,
    placing,
    placeOrder,
  };
}
