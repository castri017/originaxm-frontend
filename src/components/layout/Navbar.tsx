import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SITE, whatsappLink } from '../../config/site';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from '../SocialIcons';
import { ShoppingCart, User, Search, Menu, LogOut, ShieldCheck, X, ChevronDown, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAdminAuthStore } from '../../store/useAdminAuthStore';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { useEffect, useState, useRef } from 'react';
import { useCategories } from '../../features/catalog/queries';

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

  const { data: categories = [] } = useCategories();
  const [activeMenu,   setActiveMenu]   = useState<string | null>(null);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [drawerCat,    setDrawerCat]    = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      {/* Barra superior: redes */}
      <div className="bg-brand-charcoal-dark text-brand-sand-dark">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end gap-4 py-2.5">
          <div className="flex items-center gap-5 flex-shrink-0">
            <Link to="/about" className="hidden sm:inline text-[12.5px] hover:text-brand-copper-light transition-colors">Conócenos</Link>
            <Link to="/shipping" className="hidden sm:inline text-[12.5px] hover:text-brand-copper-light transition-colors">Envíos</Link>
            <a
              href={SITE.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:opacity-70 transition-opacity"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href={SITE.social.facebook.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:opacity-70 transition-opacity"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a
              href={SITE.social.tiktok.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="hover:opacity-70 transition-opacity"
            >
              <TikTokIcon className="w-4 h-4" />
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="hover:opacity-70 transition-opacity"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="anim-fade fixed inset-0 z-[60] bg-brand-charcoal-dark/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="anim-drop w-full max-w-xl bg-brand-sand shadow-2xl overflow-hidden">
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
          <div className="anim-fade absolute inset-0 bg-brand-charcoal-dark/50" onClick={() => setDrawerOpen(false)} />
          <div className="anim-drawer relative w-80 max-w-[90vw] bg-brand-sand h-full flex flex-col shadow-2xl overflow-y-auto">
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
                        <Link key={type.id} to={`/catalog?category=${cat.id}&type=${type.id}`} className="block px-4 py-2.5 text-sm text-brand-charcoal-light hover:text-brand-charcoal-dark transition-colors">
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
                      className="anim-drop absolute top-full left-1/2 -translate-x-1/2 mt-0 bg-brand-sand border border-brand-line shadow-[0_20px_50px_rgba(28,26,22,0.14)] z-50 min-w-[300px] overflow-hidden"
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
                              to={`/catalog?category=${cat.id}&type=${type.id}`}
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
                  <span key={itemsCount} className="anim-bump absolute -top-0.5 -right-0.5 bg-brand-copper-light text-brand-charcoal-dark font-mono text-[10px] font-semibold w-[18px] h-[18px] flex items-center justify-center rounded-full">
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
