import {
  Bar,
  BarChart,
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

export default function RevenueBarChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={290}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
        <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'var(--color-surface-alt)' }} />
        <Bar dataKey="revenue" fill="var(--color-primary)" radius={[7, 7, 0, 0]} maxBarSize={46} />
      </BarChart>
    </ResponsiveContainer>
  );
}
