import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check } from 'lucide-react';
import '../pages/Auth.css';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <aside className="auth-page__art">
        <Link to="/" className="auth-brand">
          <BookOpen size={22} /> WebYBook
        </Link>

        <div className="auth-page__quote">
          <h2>“Sách là giấc mơ mà bạn cầm trên tay.”</h2>
          <p>— Neil Gaiman</p>
        </div>

        <ul className="auth-page__perks">
          <li>
            <Check size={16} /> Hơn 10.000 đầu sách thuộc mọi thể loại
          </li>
          <li>
            <Check size={16} /> Giao hàng nhanh toàn quốc
          </li>
          <li>
            <Check size={16} /> Ưu đãi và voucher hấp dẫn mỗi tuần
          </li>
        </ul>
      </aside>

      <main className="auth-page__panel">
        <div className="auth-card">
          <Link to="/" className="auth-card__back">
            <ArrowLeft size={15} /> Về trang chủ
          </Link>
          <h1>{title}</h1>
          {subtitle ? <p className="auth-card__subtitle">{subtitle}</p> : null}
          {children}
          {footer ? <div className="auth-card__footer">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
