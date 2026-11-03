import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingBag } from 'lucide-react';
import Loading from '@/components/common/Loading/Loading';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import Button from '@/components/common/Button/Button';
import { checkoutSchema } from '../schemas/checkoutSchema';
import { useCheckout } from '../hooks/useCheckout';
import AddressSelector from '../components/AddressSelector';
import ShippingMethodSelector from '../components/ShippingMethodSelector';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import VoucherInput from '../components/VoucherInput';
import OrderSummary from '../components/OrderSummary';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const checkout = useCheckout();
  const { cart, user } = checkout;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      address: user?.address || '',
      note: '',
    },
  });

  const onSubmit = async (values) => {
    const order = await checkout.placeOrder(values);
    if (order) navigate(`/orders/${order.id}`);
  };

  if (cart.loading) {
    return (
      <div className="page container">
        <Loading label="Đang chuẩn bị thanh toán..." />
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="page container">
        <EmptyState
          icon={ShoppingBag}
          title="Giỏ hàng đang trống"
          description="Bạn cần thêm sách vào giỏ trước khi thanh toán."
          action={
            <Link to="/books">
              <Button>Khám phá sách</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page container">
      <div className="page-head">
        <div>
          <h1>Thanh toán</h1>
          <p>Hoàn tất thông tin để đặt hàng của bạn.</p>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          <AddressSelector register={register} errors={errors} user={user} />
          <ShippingMethodSelector
            value={checkout.shippingMethod}
            onChange={checkout.setShippingMethod}
            subtotal={cart.subtotal}
          />
          <PaymentMethodSelector value={checkout.paymentMethod} onChange={checkout.setPaymentMethod} />
          <VoucherInput
            voucher={checkout.voucher}
            loading={checkout.voucherLoading}
            onApply={checkout.applyVoucher}
            onRemove={checkout.removeVoucher}
          />
        </div>

        <OrderSummary
          items={cart.items}
          subtotal={cart.subtotal}
          shippingFee={checkout.shippingFee}
          discount={checkout.discount}
          total={checkout.total}
          placing={checkout.placing}
          onPlaceOrder={handleSubmit(onSubmit)}
        />
      </div>
    </div>
  );
}
