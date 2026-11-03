import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, Moon, Sun, User } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTheme } from '@/app/providers/ThemeProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { ADMIN_NAV_GROUPS } from './AdminSidebar';

function resolveTitle(pathname) {
  const items = ADMIN_NAV_GROUPS.flatMap((group) => group.items);
  const exact = items.find((item) => item.to === pathname);
  if (exact) return exact.label;
  const nested = items
    .filter((item) => item.to !== '/admin' && pathname.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return nested?.label || 'Quản trị';
}

export default function AdminHeader({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất khỏi trang quản trị.');
    navigate('/login');
  };

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <button
          type="button"
          className="admin-header__menu"
          onClick={onToggleSidebar}
          aria-label="Mở menu quản trị"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="admin-header__title">{resolveTitle(location.pathname)}</h1>
          <span className="admin-header__subtitle">WebYBook Admin</span>
        </div>
      </div>

      <div className="admin-header__right">
        <button
          type="button"
          className="admin-icon-btn"
          onClick={toggleTheme}
          aria-label={isDark ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button type="button" className="admin-icon-btn" aria-label="Thông báo">
          <Bell size={18} />
          <span className="admin-icon-btn__dot" />
        </button>

        <div className="admin-account" ref={accountRef}>
          <button
            type="button"
            className="admin-account__trigger"
            onClick={() => setAccountOpen((value) => !value)}
            aria-expanded={accountOpen}
            aria-haspopup="menu"
          >
            <span className="admin-account__avatar">
              {(user?.fullName || 'A').charAt(0).toUpperCase()}
            </span>
            <span className="admin-account__info">
              <strong>{user?.fullName || 'Quản trị viên'}</strong>
              <small>Quản trị viên</small>
            </span>
            <ChevronDown size={15} />
          </button>

          {accountOpen ? (
            <div className="admin-account__dropdown" role="menu">
              <Link to="/profile" role="menuitem" onClick={() => setAccountOpen(false)}>
                <User size={16} /> Hồ sơ cá nhân
              </Link>
              <button type="button" role="menuitem" onClick={handleLogout}>
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
