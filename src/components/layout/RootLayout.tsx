import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';

export default function RootLayout() {
  const location = useLocation();
  const isAdmin  = location.pathname.startsWith('/admin');

  // Al navegar, subir al inicio (o a la sección del #hash si existe)
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; }
    }
    window.scrollTo(0, 0);
  }, [location.key, location.hash]);

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
