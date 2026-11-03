import { Link } from 'react-router-dom';
import { BookOpen, Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { appConfig } from '@/infrastructure/config/appConfig';

const SHOP_LINKS = [
  { to: '/books', label: 'Tất cả sách' },
  { to: '/books?sort=bestseller', label: 'Sách bán chạy' },
  { to: '/books?sort=newest', label: 'Sách mới' },
  { to: '/cart', label: 'Giỏ hàng' },
];

const SUPPORT_LINKS = [
  { to: '/contact', label: 'Liên hệ & hỗ trợ' },
  { to: '/orders', label: 'Tra cứu đơn hàng' },
  { to: '/profile', label: 'Tài khoản' },
  { to: '/login', label: 'Đăng nhập' },
];

export default function CustomerFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__top">
        <div className="site-footer__brand">
          <Link to="/" className="site-brand site-brand--footer">
            <span className="site-brand__mark">
              <BookOpen size={20} />
            </span>
            <span className="site-brand__name">
              WebY<em>Book</em>
            </span>
          </Link>
          <p>
            Nhà sách trực tuyến với hàng ngàn đầu sách hay, giao hàng nhanh và nhiều ưu đãi dành cho
            bạn.
          </p>
          <div className="site-footer__social">
            <a href="#facebook" aria-label="Facebook">
              <Facebook size={17} />
            </a>
            <a href="#instagram" aria-label="Instagram">
              <Instagram size={17} />
            </a>
            <a href="#youtube" aria-label="YouTube">
              <Youtube size={17} />
            </a>
          </div>
        </div>

        <div className="site-footer__col">
          <h4>Mua sắm</h4>
          {SHOP_LINKS.map((link) => (
            <Link key={link.label} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="site-footer__col">
          <h4>Hỗ trợ</h4>
          {SUPPORT_LINKS.map((link) => (
            <Link key={link.label} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="site-footer__col site-footer__contact">
          <h4>Liên hệ</h4>
          <span>
            <Phone size={15} /> {appConfig.support.hotline}
          </span>
          <span>
            <Mail size={15} /> {appConfig.support.email}
          </span>
          <span>
            <MapPin size={15} /> {appConfig.support.address}
          </span>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} WebYBook. Bảo lưu mọi quyền.</span>
        <div>
          <a href="#terms">Điều khoản sử dụng</a>
          <a href="#privacy">Chính sách bảo mật</a>
        </div>
      </div>
    </footer>
  );
}
