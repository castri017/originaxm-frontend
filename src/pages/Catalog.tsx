import { useState, useEffect, useMemo, useRef } from 'react';
import { API } from '../config/api';
import { useSearchParams } from 'react-router-dom';
import { Package, X, ChevronDown } from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import FloatingCartButton from '../components/layout/FloatingCartButton';
import ProductCard from '../components/ProductCard';

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
  { value: 'name_asc',   label: 'Nombre A-Z' },
  { value: 'name_desc',  label: 'Nombre Z-A' },
];

/* ── Dropdown de filtro ───────────────────────────────────── */
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
      <div className={`flex items-center border text-[13.5px] font-semibold transition-colors cursor-pointer select-none ${active ? 'bg-brand-charcoal-dark text-brand-sand border-brand-charcoal-dark' : 'bg-brand-sand text-brand-charcoal border-brand-line hover:border-brand-charcoal-light'}`}>
        <button onClick={() => setOpen(p => !p)} className="flex items-center gap-2 pl-4 pr-2.5 py-2.5 min-h-[44px]">
          {label}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {active && onClear && (
          <button onClick={(e) => { e.stopPropagation(); onClear(); setOpen(false); }} className="pr-3 pl-0.5 py-2.5 hover:opacity-70" aria-label={`Quitar ${label}`}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-brand-sand border border-brand-line shadow-[0_20px_50px_rgba(28,26,22,0.14)] z-30 min-w-[220px] py-1 overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}

function DropItem({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between gap-4 px-4 py-2.5 text-[13.5px] transition-colors ${active ? 'bg-gray-100 text-brand-charcoal-dark font-bold' : 'hover:bg-gray-100 text-brand-charcoal-light'}`}>
      <span>{label}</span>
      {count !== undefined && <span className="font-mono text-[11px] text-brand-muted">{count}</span>}
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

  const catLabel  = activeCat    ? (categories.find(c => c.id === activeCat)?.name   ?? 'Categoría') : 'Categoría';
  const typeLabel = activeType   ? (availableTypes.find(t => t.id === activeType)?.name ?? 'Tipo')   : 'Tipo';
  const subLabel  = activeSubType ? (availableSubTypes.find(s => s.id === activeSubType)?.name ?? 'Capacidad') : 'Capacidad';
  const sortLabel = sortOrder    ? (SORT_OPTIONS.find(o => o.value === sortOrder)?.label ?? 'Ordenar') : 'Ordenar';
  const priceLabel = (priceMin || priceMax) ? `$${priceMin||'0'} – $${priceMax||'∞'}` : 'Precio';

  return (
    <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Encabezado */}
      <div className="mb-7 flex flex-col gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-muted">Inicio / Catálogo</span>
        <h1 className="font-display font-extrabold text-[32px] sm:text-[38px] tracking-[-0.03em] text-brand-charcoal-dark">
          Todo el catálogo
        </h1>
        <p className="text-[14px] text-brand-charcoal-light">
          {loading ? 'Cargando…' : `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* ── Barra de filtros ─────────────────────────────── */}
      <div className="sticky top-14 sm:top-16 lg:top-20 z-20 bg-brand-sand/95 backdrop-blur-sm border-y border-brand-line -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-9">
        <div className="flex items-center gap-2 flex-wrap">

          {/* Categoría */}
          <FilterPill label={catLabel} active={!!activeCat} onClear={() => selectCat('')}>
            <DropItem label="Todos" count={products.length} active={!activeCat} onClick={() => selectCat('')} />
            <div className="border-t border-brand-line my-1" />
            {categories.map(c => (
              <DropItem key={c.id} label={c.name} count={countByCat[c.id] || 0} active={activeCat === c.id} onClick={() => selectCat(activeCat === c.id ? '' : c.id)} />
            ))}
          </FilterPill>

          {/* Tipo */}
          {availableTypes.length > 0 && (
            <FilterPill label={typeLabel} active={!!activeType} onClear={() => { setActiveType(''); setActiveSubType(''); }}>
              <DropItem label="Todos" active={!activeType} onClick={() => { setActiveType(''); setActiveSubType(''); }} />
              <div className="border-t border-brand-line my-1" />
              {availableTypes.map(t => (
                <DropItem key={t.id} label={t.name} count={countByType[t.id] || 0} active={activeType === t.id} onClick={() => { setActiveType(activeType === t.id ? '' : t.id); setActiveSubType(''); }} />
              ))}
            </FilterPill>
          )}

          {/* Capacidad */}
          {availableSubTypes.length > 0 && (
            <FilterPill label={subLabel} active={!!activeSubType} onClear={() => setActiveSubType('')}>
              <DropItem label="Todas" active={!activeSubType} onClick={() => setActiveSubType('')} />
              <div className="border-t border-brand-line my-1" />
              {availableSubTypes.map(s => (
                <DropItem key={s.id} label={s.name} count={countBySubType[s.id] || 0} active={activeSubType === s.id} onClick={() => setActiveSubType(activeSubType === s.id ? '' : s.id)} />
              ))}
            </FilterPill>
          )}

          {/* Precio */}
          <div className="relative" ref={priceRef}>
            <div className={`flex items-center border text-[13.5px] font-semibold transition-colors cursor-pointer select-none ${(priceMin||priceMax) ? 'bg-brand-charcoal-dark text-brand-sand border-brand-charcoal-dark' : 'bg-brand-sand text-brand-charcoal border-brand-line hover:border-brand-charcoal-light'}`}>
              <button onClick={() => setPriceOpen(p => !p)} className="flex items-center gap-2 pl-4 pr-2.5 py-2.5 min-h-[44px]">
                {priceLabel}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
              </button>
              {(priceMin||priceMax) && (
                <button onClick={() => { setPriceMin(''); setPriceMax(''); setPriceOpen(false); }} className="pr-3 pl-0.5 py-2.5 hover:opacity-70" aria-label="Quitar precio">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {priceOpen && (
              <div className="absolute top-full left-0 mt-1 bg-brand-sand border border-brand-line shadow-[0_20px_50px_rgba(28,26,22,0.14)] z-30 p-4 w-64">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-brand-muted mb-3">Rango de precio</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted block mb-1.5">Mínimo</label>
                    <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="0" className="w-full border border-brand-line bg-brand-sand px-3 py-2.5 text-sm focus:outline-none focus:border-brand-charcoal-dark" />
                  </div>
                  <div className="flex-1">
                    <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted block mb-1.5">Máximo</label>
                    <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="∞" className="w-full border border-brand-line bg-brand-sand px-3 py-2.5 text-sm focus:outline-none focus:border-brand-charcoal-dark" />
                  </div>
                </div>
                <button onClick={() => setPriceOpen(false)} className="mt-3 w-full bg-brand-charcoal-dark text-brand-sand font-display font-bold text-[13.5px] py-3 min-h-[44px] hover:bg-brand-charcoal transition-colors">
                  Aplicar
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-brand-line mx-1 hidden sm:block" />

          {/* Ordenar */}
          <FilterPill label={sortLabel} active={!!sortOrder} onClear={() => setSortOrder('')}>
            {SORT_OPTIONS.map(o => (
              <DropItem key={o.value} label={o.label} active={sortOrder === o.value} onClick={() => setSortOrder(o.value)} />
            ))}
          </FilterPill>

          {activeFilters.length > 0 && (
            <button onClick={clearAll} className="ml-auto flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-brand-muted hover:text-brand-charcoal-dark transition-colors py-2 px-2">
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* Chips activos */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeFilters.map(f => (
              <span key={f.key} className="inline-flex items-center gap-2 bg-brand-sand-dark text-brand-charcoal text-[12.5px] font-semibold px-3 py-1.5 border border-brand-line">
                {f.label}
                <button onClick={f.clear} className="hover:text-brand-charcoal-dark transition-colors" aria-label={`Quitar ${f.label}`}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Grid ─────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-100" />
              <div className="pt-3.5 space-y-2">
                <div className="h-3.5 bg-gray-100 w-3/4" />
                <div className="h-3 bg-gray-100 w-1/2" />
                <div className="h-3.5 bg-gray-100 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <Package className="w-14 h-14 text-brand-line mb-4" />
          <p className="text-brand-charcoal-light">No hay productos con estos filtros.</p>
          <button onClick={clearAll} className="btn-ghost mt-6">
            Ver todos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index === 0}
              imgFailed={imgErrors.has(product.id)}
              onImgError={() => onImgError(product.id)}
            />
          ))}
        </div>
      )}
      <FloatingCartButton />
    </div>
  );
}
