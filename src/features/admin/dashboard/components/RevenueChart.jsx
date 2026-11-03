import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCompactCurrency, formatCurrency } from '@/shared/utils/formatCurrency';

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>Tháng {label.replace('T', '')}</strong>
      <span>Doanh thu: {formatCurrency(point.revenue)}</span>
      <span>{point.orders} đơn hàng</span>
    </div>
  );
}

export default function RevenueChart({ data = [] }) {
  const hasData = data.some((point) => point.revenue > 0);

  return (
    <section className="admin-chart-card">
      <div className="admin-chart-card__head">
        <div>
          <h3>Doanh thu 6 tháng gần nhất</h3>
          <p>Chỉ tính các đơn hàng không bị hủy</p>
        </div>
      </div>
      <div className="admin-chart-card__body">
        {hasData ? (
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.34} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-line)" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
                dy={8}
              />
              <YAxis
                width={72}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
                tickFormatter={(value) => formatCompactCurrency(value)}
              />
              <Tooltip content={<RevenueTooltip />} cursor={{ stroke: 'var(--color-line)' }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-primary)"
                strokeWidth={2.6}
                fill="url(#revenueFill)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--color-surface)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">Chưa có doanh thu trong 6 tháng gần đây.</div>
        )}
      </div>
    </section>
  );
}
