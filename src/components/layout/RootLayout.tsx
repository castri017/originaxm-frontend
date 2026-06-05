import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';

export default function RootLayout() {
  const location = useLocation();
  const isAdmin  = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* pb-16 on mobile compensates for the fixed BottomNav (h-16) */}
      <main className="flex-grow pb-16 sm:pb-0">
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
      {/* BottomNav: mobile only, hidden on admin routes */}
      {!isAdmin && (
        <div className="sm:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
