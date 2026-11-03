import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import './CustomerLayout.css';

export default function CustomerLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="customer-layout">
      <CustomerHeader />
      <main className="customer-layout__main">
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  );
}
