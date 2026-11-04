import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  ShoppingCart,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCart } from '@/features/cart/hooks/useCart';
import { useTheme } from '@/app/providers/ThemeProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { cn } from '@/shared/utils/cn';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/books', label: 'Kho sách' },
  { to: '/orders', label: 'Đơn hàng', private: true },
  { to: '/contact', label: 'Liên hệ' },
];

export default function CustomerHeader() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const value = keyword.trim();
    setMenuOpen(false);
    navigate(value ? `/books?keyword=${encodeURIComponent(value)}` : '/books');
  };

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    setMenuOpen(false);
    toast.success('Bạn đã đăng xuất.');
    navigate('/');
  };

  const visibleLinks = NAV_LINKS.filter((link) => !link.private || user);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-brand" aria-label="WebYBook - Trang chủ">
          <span className="site-brand__mark">
            <BookOpen size={20} />
          </span>
          <span className="site-brand__name">
            WebY<em>Book</em>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Điều hướng chính">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => cn('site-nav__link', isActive && 'is-active')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <form className="header-search" onSubmit={handleSearch} role="search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm sách, tác giả..."
            aria-label="Tìm kiếm sách"
          />
        </form>

        <div className="site-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={isDark ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}
            title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <Link to="/cart" className="icon-btn icon-btn--cart" aria-label={`Giỏ hàng (${count})`}>
            <ShoppingCart size={19} />
            {count > 0 ? <span className="icon-btn__badge">{count > 99 ? '99+' : count}</span> : null}
          </Link>

          {user ? (
            <div className="account-menu" ref={accountRef}>
              <button
                type="button"
                className="account-menu__trigger"
                onClick={() => setAccountOpen((value) => !value)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <span className="account-menu__avatar">
                  {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                </span>
                <span className="account-menu__name">{user.fullName || user.username}</span>
                <ChevronDown size={15} />
              </button>

              {accountOpen ? (
                <div className="account-menu__dropdown" role="menu">
                  <div className="account-menu__head">
                    <strong>{user.fullName || user.username}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Link to="/profile" role="menuitem" onClick={() => setAccountOpen(false)}>
                    <User size={16} /> Tài khoản của tôi
                  </Link>
                  <Link to="/orders" role="menuitem" onClick={() => setAccountOpen(false)}>
                    <Package size={16} /> Đơn hàng
                  </Link>
                  {isAdmin ? (
                    <Link to="/admin" role="menuitem" onClick={() => setAccountOpen(false)}>
                      <LayoutDashboard size={16} /> Trang quản trị
                    </Link>
                  ) : null}
                  <button type="button" role="menuitem" onClick={handleLogout}>
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="site-actions__auth">
              <Link to="/login" className="btn btn--ghost btn--sm">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn--primary btn--sm">
                Đăng ký
              </Link>
            </div>
          )}

          <button
            type="button"
            className="icon-btn site-actions__toggle"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="mobile-nav">
          <form className="mobile-nav__search" onSubmit={handleSearch} role="search">
            <Search size={17} />
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm sách, tác giả..."
              aria-label="Tìm kiếm sách"
            />
          </form>
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => cn('mobile-nav__link', isActive && 'is-active')}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/profile" onClick={() => setMenuOpen(false)} className="mobile-nav__link">
            Tài khoản
          </NavLink>
          {isAdmin ? (
            <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="mobile-nav__link">
              Trang quản trị
            </NavLink>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
