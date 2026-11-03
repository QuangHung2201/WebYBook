import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import './AdminLayout.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="admin-layout">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-layout__body">
        <AdminHeader onToggleSidebar={() => setSidebarOpen((value) => !value)} />
        <main className="admin-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
