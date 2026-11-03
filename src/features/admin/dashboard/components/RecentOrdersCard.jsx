import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import OrderStatus from '@/features/orders/components/OrderStatus';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDateTime } from '@/shared/utils/formatDate';

export default function RecentOrdersCard({ orders = [] }) {
  return (
    <section className="admin-chart-card">
      <div className="admin-chart-card__head">
        <div>
          <h3>Đơn hàng gần đây</h3>
          <p>Cập nhật mới nhất từ cửa hàng</p>
        </div>
        <Link to="/admin/orders" className="link">
          Xem tất cả <ArrowRight size={14} />
        </Link>
      </div>
      {orders.length === 0 ? (
        <div className="chart-empty">Chưa có đơn hàng nào.</div>
      ) : (
        <div className="table-wrap admin-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>#{order.code}</strong>
                  </td>
                  <td>
                    <div className="admin-user-cell">
                      <span className="admin-user-cell__avatar">
                        {(order.customerName || 'K').charAt(0).toUpperCase()}
                      </span>
                      <div className="admin-user-cell__info">
                        <strong>{order.customerName}</strong>
                        <span>{order.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="muted">{formatDateTime(order.createdAt)}</td>
                  <td className="admin-money">{formatCurrency(order.total)}</td>
                  <td>
                    <OrderStatus status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
