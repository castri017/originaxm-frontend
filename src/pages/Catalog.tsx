import { useState, useEffect, useMemo, useRef } from 'react';
import { API } from '../config/api';
import { useSearchParams, Link } from 'react-router-dom';
import { Package, X, ChevronDown } from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import FloatingCartButton from '../components/layout/FloatingCartButton';

/* ── Types ────────────────────────────────────────────────── */
interface ApiProduct {
  id: string; name: string; manufacturer: string;
  categoryId: string; typeId: string; subTypeId: string;
  images: string[]; sellingPrice: number; discountPercentage: number; stock: number;
  isInternational?: boolean;
}
interface SubType  { id: string; name: string; }
interface ProdType { id: string; name: string; subTypes: SubType[]; }
interface Brand    { id: string; name: string; types: ProdType[]; }
interface ApiCategory { id: string; name: string; brands: Brand[]; }
type SortOption = '' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: '',           label: 'Relevancia'   },
  { value: 'price_asc',  label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'name_asc',   label: 'Nombre A → Z' },
  { value: 'name_desc',  label: 'Nombre Z → A' },
];

/* ── Dropdown pill ────────────────────────────────────────── */
function FilterPill({
  label, active, children, onClear,
}: { label: string; active: boolean; children: React.ReactNode; onClear?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className={`flex items-center rounded-full border text-sm font-semibold transition-all cursor-pointer select-none ${active ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}>
        <button onClick={() => setOpen(p => !p)} className="flex items-center gap-1.5 pl-4 pr-2 py-2">
          {label}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {active && onClear && (
          <button onClick={(e) => { e.stopPropagation(); onClear(); setOpen(false); }} className="pr-3 pl-0.5 py-2 hover:opacity-70">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-30 min-w-[200px] py-1 overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}

function DropItem({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${active ? 'bg-black text-white font-bold' : 'hover:bg-gray-50 text-gray-700'}`}>
      <span>{label}</span>
      {count !== undefined && <span className={`text-xs ml-4 ${active ? 'text-gray-300' : 'text-gray-400'}`}>{count}</span>}
    </button>
  );
}

/* ── Main ─────────────────────────────────────────────────── */
export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogVersion = useCatalogStore((s) => s.version);

  const [products,   setProducts]   = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [imgErrors,  setImgErrors]  = useState<Set<string>>(new Set());
  const onImgError = (id: string) => setImgErrors(s => new Set(s).add(id));

  const [activeCat,      setActiveCat]      = useState(searchParams.get('category') || '');
  const [activeType,     setActiveType]     = useState('');
  const [activeSubType,  setActiveSubType]  = useState('');
  const [sortOrder,      setSortOrder]      = useState<SortOption>('');
  const [priceMin,       setPriceMin]       = useState('');
  const [priceMax,       setPriceMax]       = useState('');
  const [priceOpen,      setPriceOpen]      = useState(false);
  const priceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (priceRef.current && !priceRef.current.contains(e.target as Node)) setPriceOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/products`).then(r => r.ok ? r.json() : []),
      fetch(`${API}/api/categories`).then(r => r.ok ? r.json() : []),
    ])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [catalogVersion]);

  /* derived options — only show items with products */
  const availableTypes = useMemo<ProdType[]>(() => {
    const cats = activeCat ? categories.filter(c => c.id === activeCat) : categories;
    const allTypes = cats.flatMap(c => c.brands.flatMap(b => b.types));
    // only show types that exist on at least one product
    const typeIds = new Set(products.filter(p => !activeCat || p.categoryId === activeCat).map(p => p.typeId));
    return allTypes.filter(t => typeIds.has(t.id));
  }, [activeCat, categories, products]);

  const availableSubTypes = useMemo<SubType[]>(() => {
    if (!activeType) return [];
    const subIds = new Set(products.filter(p => p.typeId === activeType).map(p => p.subTypeId).filter(Boolean));
    return (availableTypes.find(t => t.id === activeType)?.subTypes ?? []).filter(s => subIds.has(s.id));
  }, [activeType, availableTypes, products]);

  const countByCat  = useMemo(() => { const m: Record<string, number> = {}; products.forEach(p => { m[p.categoryId] = (m[p.categoryId] || 0) + 1; }); return m; }, [products]);
  const countByType = useMemo(() => {
    const base = activeCat ? products.filter(p => p.categoryId === activeCat) : products;
    const m: Record<string, number> = {}; base.forEach(p => { m[p.typeId] = (m[p.typeId] || 0) + 1; }); return m;
  }, [products, activeCat]);
  const countBySubType = useMemo(() => {
    const base = products.filter(p => p.typeId === activeType);
    const m: Record<string, number> = {}; base.forEach(p => { m[p.subTypeId] = (m[p.subTypeId] || 0) + 1; }); return m;
  }, [products, activeType]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (activeCat)     list = list.filter(p => p.categoryId === activeCat);
    if (activeType)    list = list.filter(p => p.typeId     === activeType);
    if (activeSubType) list = list.filter(p => p.subTypeId  === activeSubType);
    if (priceMin)      list = list.filter(p => p.sellingPrice >= Number(priceMin));
    if (priceMax)      list = list.filter(p => p.sellingPrice <= Number(priceMax));
    switch (sortOrder) {
      case 'price_asc':  list.sort((a, b) => a.sellingPrice - b.sellingPrice); break;
      case 'price_desc': list.sort((a, b) => b.sellingPrice - a.sellingPrice); break;
      case 'name_asc':   list.sort((a, b) => a.name.localeCompare(b.name));    break;
      case 'name_desc':  list.sort((a, b) => b.name.localeCompare(a.name));    break;
    }
    return list;
  }, [products, activeCat, activeType, activeSubType, priceMin, priceMax, sortOrder]);

  const activeFilters = [
    activeCat     && { key: 'cat',  label: categories.find(c => c.id === activeCat)?.name ?? '',                 clear: () => { setActiveCat('');     setActiveType(''); setActiveSubType(''); } },
    activeType    && { key: 'type', label: availableTypes.find(t => t.id === activeType)?.name ?? '',             clear: () => { setActiveType('');    setActiveSubType(''); } },
    activeSubType && { key: 'sub',  label: availableSubTypes.find(s => s.id === activeSubType)?.name ?? '',       clear: () => setActiveSubType('') },
    (priceMin || priceMax) && { key: 'price', label: `$${priceMin||'0'} – $${priceMax||'∞'}`, clear: () => { setPriceMin(''); setPriceMax(''); } },
    sortOrder     && { key: 'sort', label: SORT_OPTIONS.find(o => o.value === sortOrder)?.label ?? '',            clear: () => setSortOrder('') },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const selectCat = (id: string) => {
    setActiveCat(id); setActiveType(''); setActiveSubType('');
    const p = new URLSearchParams(); if (id) p.set('category', id);
    setSearchParams(p);
  };

  const clearAll = () => { setActiveCat(''); setActiveType(''); setActiveSubType(''); setSortOrder(''); setPriceMin(''); setPriceMax(''); setSearchParams({}); };

  const getImage = (p: ApiProduct) =>
    p.images?.[0]
      ? (p.images[0].startsWith('http') ? p.images[0] : `http://localhost:5173${p.images[0]}`)
      : null;

  const catLabel  = activeCat    ? (categories.find(c => c.id === activeCat)?.name   ?? 'Categoría') : 'Categoría';
  const typeLabel = activeType   ? (availableTypes.find(t => t.id === activeType)?.name ?? 'Tipo')   : 'Tipo';
  const subLabel  = activeSubType ? (availableSubTypes.find(s => s.id === activeSubType)?.name ?? 'Capacidad') : 'Capacidad';
  const sortLabel = sortOrder    ? (SORT_OPTIONS.find(o => o.value === sortOrder)?.label ?? 'Ordenar') : 'Ordenar';
  const priceLabel = (priceMin || priceMax) ? `$${priceMin||'0'} – $${priceMax||'∞'}` : 'Precio';

  return (
    <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-black">Catálogo de Productos</h1>
        <p className="text-sm text-gray-400 mt-1">
          {loading ? 'Cargando…' : `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* ── Filter bar ─────────────────────────────────────── */}
      <div className="sticky top-14 sm:top-16 lg:top-20 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-8">
        <div className="flex items-center gap-2 flex-wrap">

          {/* Categoría */}
          <FilterPill label={catLabel} active={!!activeCat} onClear={() => selectCat('')}>
            <DropItem label="Todos" count={products.length} active={!activeCat} onClick={() => selectCat('')} />
            <div className="border-t border-gray-100 my-1" />
            {categories.map(c => (
              <DropItem key={c.id} label={c.name} count={countByCat[c.id] || 0} active={activeCat === c.id} onClick={() => selectCat(activeCat === c.id ? '' : c.id)} />
            ))}
          </FilterPill>

          {/* Tipo — solo si hay tipos disponibles */}
          {availableTypes.length > 0 && (
            <FilterPill label={typeLabel} active={!!activeType} onClear={() => { setActiveType(''); setActiveSubType(''); }}>
              <DropItem label="Todos" active={!activeType} onClick={() => { setActiveType(''); setActiveSubType(''); }} />
              <div className="border-t border-gray-100 my-1" />
              {availableTypes.map(t => (
                <DropItem key={t.id} label={t.name} count={countByType[t.id] || 0} active={activeType === t.id} onClick={() => { setActiveType(activeType === t.id ? '' : t.id); setActiveSubType(''); }} />
              ))}
            </FilterPill>
          )}

          {/* Capacidad — solo si hay subtipos */}
          {availableSubTypes.length > 0 && (
            <FilterPill label={subLabel} active={!!activeSubType} onClear={() => setActiveSubType('')}>
              <DropItem label="Todas" active={!activeSubType} onClick={() => setActiveSubType('')} />
              <div className="border-t border-gray-100 my-1" />
              {availableSubTypes.map(s => (
                <DropItem key={s.id} label={s.name} count={countBySubType[s.id] || 0} active={activeSubType === s.id} onClick={() => setActiveSubType(activeSubType === s.id ? '' : s.id)} />
              ))}
            </FilterPill>
          )}

          {/* Precio — custom dropdown */}
          <div className="relative" ref={priceRef}>
            <div className={`flex items-center rounded-full border text-sm font-semibold transition-all cursor-pointer select-none ${(priceMin||priceMax) ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}>
              <button onClick={() => setPriceOpen(p => !p)} className="flex items-center gap-1.5 pl-4 pr-2 py-2">
                {priceLabel}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
              </button>
              {(priceMin||priceMax) && (
                <button onClick={() => { setPriceMin(''); setPriceMax(''); setPriceOpen(false); }} className="pr-3 pl-0.5 py-2 hover:opacity-70">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {priceOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-30 p-4 w-60">
                <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-3">Rango de precio</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Mínimo</label>
                    <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Máximo</label>
                    <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="∞" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black" />
                  </div>
                </div>
                <button onClick={() => setPriceOpen(false)} className="mt-3 w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-2 rounded-full">
                  Aplicar
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

          {/* Ordenar */}
          <FilterPill label={sortLabel} active={!!sortOrder} onClear={() => setSortOrder('')}>
            {SORT_OPTIONS.map(o => (
              <DropItem key={o.value} label={o.label} active={sortOrder === o.value} onClick={() => setSortOrder(o.value)} />
            ))}
          </FilterPill>

          {/* Limpiar todo */}
          {activeFilters.length > 0 && (
            <button onClick={clearAll} className="ml-auto flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-black transition-colors py-2 px-2">
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* Active chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2.5">
            {activeFilters.map(f => (
              <span key={f.key} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                {f.label}
                <button onClick={f.clear} className="hover:text-black transition-colors"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Product grid ─────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-100" />
              <div className="pt-3 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3.5 bg-gray-100 rounded w-1/3 mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <Package className="w-14 h-14 text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">No hay productos con estos filtros.</p>
          <button onClick={clearAll} className="mt-5 text-sm font-bold uppercase tracking-widest border border-black px-6 py-2.5 rounded-full hover:bg-black hover:text-white transition-all">
            Ver todos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
          {filteredProducts.map((product, index) => {
            const img = getImage(product);
            const outOfStock = product.stock <= 0;
            const disc = product.discountPercentage ?? 0;
            const finalPrice = disc > 0
              ? Math.round(product.sellingPrice * (1 - disc / 100))
              : product.sellingPrice;
            return (
              <Link key={product.id} to={`/product/${product.id}`} className="group flex flex-col">

                {/* Imagen portrait */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f4f4f4] flex items-center justify-center">
                  {img && !imgErrors.has(product.id)
                    ? <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
                        onError={() => onImgError(product.id)}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        fetchPriority={index === 0 ? 'high' : undefined}
                        decoding="async"
                      />
                    : <Package className="w-12 h-12 text-gray-300" />
                  }
                  {!outOfStock && disc > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                      -{disc}%
                    </span>
                  )}
                  {outOfStock && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                      Sin Stock
                    </span>
                  )}
                  {product.isInternational && (
                    <span className="absolute bottom-0 left-0 right-0 bg-black/85 text-white text-[9px] font-bold uppercase tracking-wide text-center leading-tight py-1.5 px-1">
                      Pedido internacional · Envío 10-15 días
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="pt-3">
                  <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">{product.name}</h3>
                  {product.manufacturer && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{product.manufacturer}</p>
                  )}
                  {product.sellingPrice > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        ${finalPrice.toLocaleString('es-CL')}
                      </span>
                      {disc > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                          ${product.sellingPrice.toLocaleString('es-CL')}
                        </span>
                      )}
                    </div>
                  )}
                  {outOfStock ? (
                    <div className="flex flex-col gap-2 mt-3">
                      <span className="w-full py-2.5 bg-gray-200 text-gray-500 text-sm font-bold rounded-full flex items-center justify-center cursor-not-allowed">
                        Agotado
                      </span>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`https://wa.me/573216481430?text=${encodeURIComponent(`¡Hola! Quisiera realizar un pedido del producto: ${product.name}`)}`, '_blank'); }}
                        className="w-full py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold rounded-full flex items-center justify-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        Pedir por WhatsApp
                      </button>
                    </div>
                  ) : (
                    <button className="w-full py-2.5 mt-3 bg-[#333333] hover:bg-black text-white text-sm font-bold rounded-full transition-colors flex items-center justify-center">
                      Ver Producto
                    </button>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <FloatingCartButton />
    </div>
  );
}
