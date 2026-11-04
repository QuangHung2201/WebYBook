import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Boxes,
  FolderTree,
  LayoutDashboard,
  Megaphone,
  Package,
  PenTool,
  Store,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export const ADMIN_NAV_GROUPS = [
  {
    label: 'Tổng quan',
    items: [{ to: '/admin', label: 'Bảng điều khiển', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Kinh doanh',
    items: [
      { to: '/admin/books', label: 'Quản lý sách', icon: BookOpen },
      { to: '/admin/inventory', label: 'Tồn kho', icon: Boxes },
      { to: '/admin/orders', label: 'Đơn hàng', icon: Package },
      { to: '/admin/vouchers', label: 'Voucher', icon: Megaphone },
    ],
  },
  {
    label: 'Danh mục',
    items: [
      { to: '/admin/categories', label: 'Danh mục sách', icon: FolderTree },
      { to: '/admin/authors', label: 'Tác giả', icon: PenTool },
      { to: '/admin/publishers', label: 'Nhà xuất bản', icon: Store },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { to: '/admin/users', label: 'Người dùng', icon: Users },
      { to: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
    ],
  },
];

export default function AdminSidebar({ open, onClose }) {
  return (
    <>
      <aside className={cn('admin-sidebar', open && 'is-open')}>
        <div className="admin-sidebar__head">
          <NavLink to="/admin" className="admin-brand" onClick={onClose}>
            <span className="admin-brand__mark">
              <BookOpen size={19} />
            </span>
            <span>
              WebY<em>Book</em>
              <small>Quản trị</small>
            </span>
          </NavLink>
          <button type="button" className="admin-sidebar__close" onClick={onClose} aria-label="Đóng menu">
            <X size={19} />
          </button>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Điều hướng quản trị">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.label} className="admin-sidebar__group">
              <span className="admin-sidebar__label">{group.label}</span>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) => cn('admin-sidebar__link', isActive && 'is-active')}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <NavLink to="/" className="admin-sidebar__store" onClick={onClose}>
          <Store size={17} />
          <span>Về cửa hàng</span>
        </NavLink>
      </aside>
      {open ? <button type="button" className="admin-sidebar__backdrop" onClick={onClose} aria-label="Đóng menu" /> : null}
    </>
  );
}
