import { Input, Textarea } from '@/components/common/Input/Input';

export default function AddressSelector({ register, errors, user }) {
  return (
    <section className="panel checkout-panel">
      <h3 className="panel-title">Thông tin nhận hàng</h3>
      <div className="form-grid">
        <div className="form-row">
          <Input
            label="Họ tên người nhận"
            placeholder="Nguyễn Văn An"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Số điện thoại"
            placeholder="0912345678"
            inputMode="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>
        <Input
          label="Địa chỉ nhận hàng"
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
          error={errors.address?.message}
          {...register('address')}
        />
        <Textarea
          label="Ghi chú (không bắt buộc)"
          placeholder="Ví dụ: giao ngoài giờ hành chính, gọi trước khi giao..."
          rows={3}
          error={errors.note?.message}
          {...register('note')}
        />
        {user?.email ? (
          <p className="checkout-hint">
            Đơn hàng sẽ được gửi tới email <strong>{user.email}</strong>.
          </p>
        ) : null}
      </div>
    </section>
  );
}
