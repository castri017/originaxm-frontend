import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Search, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useUIStore } from '../../store/useUIStore';

const NAV_ITEMS = [
  { icon: Home,         label: 'Inicio',   path: '/'       },
  { icon: Grid,         label: 'Catálogo', path: '/catalog' },
  { icon: Search,       label: 'Buscar',   path: '__search' },
  { icon: ShoppingCart, label: 'Carrito',  path: '/cart', badge: true },
  { icon: User,         label: 'Perfil',   path: '/profile' },
];

export default function BottomNav() {
  const location   = useLocation();
  const openSearch = useUIStore((s) => s.openSearch);
  const itemsCount = useCartStore((s) => s.getTotals().itemsCount);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-stretch h-16"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegación principal"
    >
      {NAV_ITEMS.map(({ icon: Icon, label, path, badge }) => {
        const isSearch = path === '__search';
        const isActive = !isSearch && (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

        const inner = (
          <>
            <div className="relative flex items-center justify-center">
              <Icon className={`w-5 h-5 stroke-[1.5] transition-colors ${isActive ? 'text-black' : 'text-gray-400'}`} />
              {badge && itemsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-black text-white text-[9px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full">
                  {itemsCount > 9 ? '9+' : itemsCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-0.5 font-semibold tracking-tight transition-colors ${isActive ? 'text-black' : 'text-gray-400'}`}>
              {label}
            </span>
          </>
        );

        if (isSearch) {
          return (
            <button
              key={path}
              onClick={openSearch}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[44px] active:bg-gray-50 transition-colors"
              aria-label="Buscar"
            >
              {inner}
            </button>
          );
        }

        return (
          <Link
            key={path}
            to={path}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[44px] active:bg-gray-50 transition-colors"
            aria-label={label}
          >
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}
