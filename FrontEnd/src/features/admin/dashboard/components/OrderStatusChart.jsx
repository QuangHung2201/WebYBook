import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

function StatusTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>{point.name}</strong>
      <span>{point.value} đơn hàng</span>
    </div>
  );
}

export default function OrderStatusChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="admin-chart-card">
      <div className="admin-chart-card__head">
        <div>
          <h3>Trạng thái đơn hàng</h3>
          <p>{total} đơn hàng</p>
        </div>
      </div>
      <div className="admin-chart-card__body admin-chart-card__body--tight">
        {total > 0 ? (
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={54}
                outerRadius={84}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<StatusTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty" style={{ minHeight: 210 }}>
            Chưa có đơn hàng.
          </div>
        )}
      </div>
      <div className="chart-legend">
        {data.map((entry) => (
          <span key={entry.status} className="chart-legend__item">
            <span className="chart-legend__dot" style={{ background: entry.color }} />
            {entry.name} ({entry.value})
          </span>
        ))}
      </div>
    </section>
  );
}
