import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API } from '../../config/api';
import { ShoppingCart, User, Search, Menu, LogOut, ShieldCheck, X, ChevronDown, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAdminAuthStore } from '../../store/useAdminAuthStore';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { useEffect, useState, useRef } from 'react';

interface ProdType  { id: string; name: string; }
interface Brand     { id: string; name: string; types: ProdType[]; }
interface NavCategory { id: string; name: string; brands: Brand[]; }

export default function Navbar() {
  const itemsCount    = useCartStore((s) => s.getTotals().itemsCount);
  const location      = useLocation();
  const navigate      = useNavigate();
  const isAdmin       = location.pathname.startsWith('/admin');
  const { isAuthenticated, fullName, logout } = useAdminAuthStore();
  const customer      = useCustomerAuthStore((s) => s.customer);
  const isCustomerAuth = useCustomerAuthStore((s) => s.isAuthenticated);
  const customerLogout = useCustomerAuthStore((s) => s.logout);

  const searchOpen  = useUIStore((s) => s.searchOpen);
  const openSearch  = useUIStore((s) => s.openSearch);
  const closeSearch = useUIStore((s) => s.closeSearch);

  const [categories,   setCategories]   = useState<NavCategory[]>([]);
  const [activeMenu,   setActiveMenu]   = useState<string | null>(null);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [drawerCat,    setDrawerCat]    = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then(r => r.ok ? r.json() : [])
      .then((data: NavCategory[]) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  const handleCloseSearch = () => { closeSearch(); setSearchQuery(''); };

  useEffect(() => { setDrawerOpen(false); setActiveMenu(null); }, [location.pathname]);

  const handleMouseEnter = (id: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setActiveMenu(id);
  };
  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      handleCloseSearch();
    }
  };

  /* ── Admin navbar ───────────────────────────────────────── */
  if (isAdmin) {
    return (
      <header className="bg-brand-charcoal-dark text-brand-sand sticky top-0 z-50 border-b border-brand-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="OrigenAXM" className="h-9 w-auto object-contain rounded-sm p-0.5 bg-brand-sand" />
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-muted">Panel Admin</span>
            </div>
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-brand-sand-dark">
                  <ShieldCheck className="w-4 h-4 text-brand-copper-light" />
                  <span className="font-medium">{fullName}</span>
                </div>
                <button onClick={logout} className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-brand-muted hover:text-brand-sand transition-colors px-3 py-1.5 hover:bg-brand-charcoal">
                  <LogOut className="w-4 h-4" /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  /* ── Store navbar ───────────────────────────────────────── */
  return (
    <>
      {/* Barra superior: promesa de marca + redes */}
      <div className="bg-brand-charcoal-dark text-brand-sand-dark">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-copper-light flex-shrink-0" />
            <span className="text-[12.5px] tracking-[0.02em] truncate">
              Productos originales · garantía de por vida
            </span>
          </div>
          <div className="flex items-center gap-5 flex-shrink-0">
            <Link to="/about" className="hidden sm:inline text-[12.5px] hover:text-brand-copper-light transition-colors">Conócenos</Link>
            <Link to="/shipping" className="hidden sm:inline text-[12.5px] hover:text-brand-copper-light transition-colors">Envíos</Link>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:opacity-70 transition-opacity"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://wa.me/573216481430"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="hover:opacity-70 transition-opacity"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-brand-charcoal-dark/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="w-full max-w-xl bg-brand-sand shadow-2xl overflow-hidden">
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4">
              <Search className="w-5 h-5 text-brand-muted flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Busca tu producto…"
                className="flex-1 text-base outline-none text-brand-charcoal-dark placeholder-brand-muted"
              />
              <button type="button" onClick={handleCloseSearch} className="p-1 hover:bg-brand-sand-dark transition-colors">
                <X className="w-5 h-5 text-brand-charcoal-light" />
              </button>
            </form>
            <div className="border-t border-brand-line px-5 py-3">
              <p className="text-xs text-brand-charcoal-light">Presiona Enter para buscar o <button onClick={handleCloseSearch} className="text-brand-copper font-bold hover:underline">cancelar</button></p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-brand-charcoal-dark/50" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-80 max-w-[90vw] bg-brand-sand h-full flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-line">
              <img src="/logo.png" alt="OrigenAXM" className="h-10 w-auto object-contain" />
              <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-brand-sand-dark transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              <Link to="/catalog" className="flex items-center justify-between px-3 py-3.5 min-h-[48px] hover:bg-brand-sand-dark font-display font-bold text-[15px] text-brand-charcoal-dark transition-colors">
                Todo el catálogo
                <ArrowRight className="w-4 h-4 text-brand-muted" />
              </Link>
              {categories.map(cat => (
                <div key={cat.id}>
                  <button
                    onClick={() => setDrawerCat(drawerCat === cat.id ? null : cat.id)}
                    className="flex items-center justify-between w-full px-3 py-3.5 min-h-[48px] hover:bg-brand-sand-dark font-display font-bold text-[15px] text-brand-charcoal-dark transition-colors"
                  >
                    {cat.name}
                    <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform ${drawerCat === cat.id ? 'rotate-180' : ''}`} />
                  </button>
                  {drawerCat === cat.id && (
                    <div className="ml-3 mt-1 mb-2 border-l border-brand-line">
                      <Link to={`/catalog?category=${cat.id}`} className="block px-4 py-2.5 text-sm text-brand-copper hover:text-brand-copper-dark font-semibold transition-colors">
                        Ver todo en {cat.name}
                      </Link>
                      {cat.brands.flatMap(b => b.types).map(type => (
                        <Link key={type.id} to={`/catalog?category=${cat.id}`} className="block px-4 py-2.5 text-sm text-brand-charcoal-light hover:text-brand-charcoal-dark transition-colors">
                          {type.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-brand-line space-y-1">
              <Link to="/cart" className="flex items-center gap-3 px-3 py-3.5 min-h-[48px] hover:bg-brand-sand-dark text-sm font-semibold text-brand-charcoal-dark transition-colors">
                <ShoppingCart className="w-5 h-5" />
                Carrito {itemsCount > 0 && <span className="bg-brand-copper-light text-brand-charcoal-dark font-mono text-[11px] px-2 py-0.5">{itemsCount}</span>}
              </Link>
              {isCustomerAuth && customer ? (
                <>
                  <Link to="/profile" className="flex items-center gap-3 px-3 py-3.5 min-h-[48px] hover:bg-brand-sand-dark text-sm font-semibold text-brand-charcoal-dark transition-colors">
                    <div className="w-5 h-5 bg-brand-charcoal-dark text-brand-sand rounded-full flex items-center justify-center text-[10px] font-extrabold">
                      {customer.fullName.charAt(0).toUpperCase()}
                    </div>
                    {customer.fullName}
                  </Link>
                  <button
                    onClick={() => { customerLogout(); navigate('/'); setDrawerOpen(false); }}
                    className="flex items-center gap-3 px-3 py-3.5 min-h-[48px] hover:bg-brand-sand-dark text-sm font-semibold text-brand-charcoal-light transition-colors w-full text-left"
                  >
                    <LogOut className="w-5 h-5" /> Cerrar sesión
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center gap-3 px-3 py-3.5 min-h-[48px] hover:bg-brand-sand-dark text-sm font-semibold text-brand-charcoal-dark transition-colors">
                  <User className="w-5 h-5" /> Iniciar sesión / Registrarse
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="bg-brand-sand sticky top-0 z-40 border-b border-brand-line">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">

            {/* Logo + Nav grouped left */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0">
                <img src="/logo.png" alt="OrigenAXM" className="h-9 sm:h-11 lg:h-14 w-auto object-contain" />
              </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-7">
              {/* Todo el Catálogo */}
              <Link
                to="/catalog"
                className="relative py-2 font-display text-[15px] font-semibold text-brand-charcoal-dark transition-colors group"
              >
                Todo el catálogo
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-charcoal-dark scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>

              {/* Category dropdowns */}
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(cat.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="relative flex items-center gap-1.5 py-2 font-display text-[15px] font-semibold text-brand-charcoal-dark transition-colors group">
                    {cat.name}
                    <ChevronDown className={`w-3.5 h-3.5 text-brand-charcoal-light transition-transform duration-200 ${activeMenu === cat.id ? 'rotate-180' : ''}`} />
                    <span className={`absolute bottom-0 left-0 right-0 h-[2px] bg-brand-charcoal-dark transition-transform origin-left ${activeMenu === cat.id ? 'scale-x-100' : 'scale-x-0'}`} />
                  </button>

                  {/* Mega dropdown */}
                  {activeMenu === cat.id && (
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-0 bg-brand-sand border border-brand-line shadow-[0_20px_50px_rgba(28,26,22,0.14)] z-50 min-w-[300px] overflow-hidden"
                      onMouseEnter={() => handleMouseEnter(cat.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Header */}
                      <div className="px-5 py-4 bg-gray-100 border-b border-brand-line">
                        <Link to={`/catalog?category=${cat.id}`} className="flex items-center justify-between group">
                          <div>
                            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-copper">Colección</p>
                            <p className="font-display font-extrabold text-brand-charcoal-dark text-base mt-1">{cat.name}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-brand-charcoal-light group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>

                      {/* Types list */}
                      {cat.brands.flatMap(b => b.types).length > 0 && (
                        <div className="py-2">
                          {cat.brands.flatMap(b => b.types).map(type => (
                            <Link
                              key={type.id}
                              to={`/catalog?category=${cat.id}`}
                              className="flex items-center justify-between px-5 py-2.5 hover:bg-gray-100 text-sm text-brand-charcoal-light hover:text-brand-charcoal-dark font-medium transition-colors group"
                            >
                              {type.name}
                              <ArrowRight className="w-3.5 h-3.5 text-brand-line group-hover:text-brand-copper group-hover:translate-x-0.5 transition-all" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Footer CTA */}
                      <div className="px-5 py-3.5 border-t border-brand-line">
                        <Link to={`/catalog?category=${cat.id}`} className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-copper hover:text-brand-copper-dark transition-colors flex items-center gap-1.5">
                          Ver toda la colección <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
            </div>{/* end logo+nav */}

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={openSearch}
                className="p-2.5 hover:bg-brand-sand-dark transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5 stroke-[1.5]" />
              </button>
              <Link to="/cart" className="p-2.5 hover:bg-brand-sand-dark transition-colors relative flex items-center">
                <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
                {itemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-copper-light text-brand-charcoal-dark font-mono text-[10px] font-semibold w-[18px] h-[18px] flex items-center justify-center rounded-full">
                    {itemsCount > 9 ? '9+' : itemsCount}
                  </span>
                )}
              </Link>

              {/* Customer auth */}
              {isCustomerAuth && customer ? (
                <div className="hidden md:flex items-center gap-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-brand-sand-dark transition-colors"
                    title={`Mi cuenta — ${customer.fullName}`}
                  >
                    <div className="w-6 h-6 bg-brand-charcoal-dark text-brand-sand rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0">
                      {customer.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-brand-charcoal-dark max-w-[90px] truncate">{customer.fullName.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={() => { customerLogout(); navigate('/'); }}
                    className="p-2 hover:bg-brand-sand-dark transition-colors text-brand-muted hover:text-brand-charcoal-dark"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-1.5 p-2.5 hover:bg-brand-sand-dark transition-colors"
                  aria-label="Iniciar sesión"
                  title="Iniciar sesión"
                >
                  <User className="w-5 h-5 stroke-[1.5]" />
                </Link>
              )}

              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden p-2.5 hover:bg-brand-sand-dark transition-colors"
                aria-label="Menú"
              >
                <Menu className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
