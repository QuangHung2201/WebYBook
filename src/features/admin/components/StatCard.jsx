import { cn } from '@/shared/utils/cn';

export default function StatCard({ label, value, icon: Icon, tone = 'primary', meta }) {
  return (
    <article className="stat-card">
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        {Icon ? (
          <span className={cn('stat-card__icon', tone !== 'primary' && `stat-card__icon--${tone}`)}>
            <Icon size={19} />
          </span>
        ) : null}
      </div>
      <strong className="stat-card__value">{value}</strong>
      {meta ? <span className="stat-card__meta">{meta}</span> : null}
    </article>
  );
}
