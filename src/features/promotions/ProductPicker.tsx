import { useMemo, useState } from 'react';
import { AlertCircle, Loader2, Package, RefreshCw, Search, X } from 'lucide-react';

export interface PromotionProductOption {
  id: string;
  name: string;
  productCode?: string;
  images?: string[];
  sellingPrice: number;
  stock?: number;
  categoryId?: string;
}

export interface CategoryOption {
  id: string;
  name: string;
}

interface Props {
  products: PromotionProductOption[];
  categories: CategoryOption[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** Producto → títulos de otras promociones vigentes o programadas que ya lo incluyen. */
  otherPromotionsByProduct: Map<string, string[]>;
}

const inputClass =
  'w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400';

export default function ProductPicker({
  products, categories, loading, error, onRetry, selectedIds, onChange, otherPromotionsByProduct,
}: Props) {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const productsById = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  // Solo categorías que tienen productos, para no ofrecer filtros vacíos.
  const usedCategories = useMemo(() => {
    const used = new Set(products.map(p => p.categoryId).filter(Boolean));
    return categories.filter(c => used.has(c.id));
  }, [categories, products]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products
      .filter(p => !categoryId || p.categoryId === categoryId)
      .filter(p => !term || p.name.toLowerCase().includes(term) || p.productCode?.toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [products, search, categoryId]);

  const toggle = (id: string) =>
    onChange(selected.has(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);

  const allVisibleSelected = visible.length > 0 && visible.every(p => selected.has(p.id));

  const selectVisible = () => {
    const next = new Set(selectedIds);
    visible.forEach(p => next.add(p.id));
    onChange([...next]);
  };

  const unselectVisible = () => {
    const hidden = new Set(visible.map(p => p.id));
    onChange(selectedIds.filter(id => !hidden.has(id)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 border border-gray-100 rounded-sm text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Cargando productos...
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-sm text-sm text-red-600">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1">{error}</span>
        <button type="button" onClick={onRetry} className="flex items-center gap-1 text-xs font-bold hover:underline">
          <RefreshCw className="w-3.5 h-3.5" /> Reintentar
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10 border border-gray-100 rounded-sm text-gray-400">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Aún no hay productos creados en el sistema.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Seleccionados */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="Productos seleccionados">
          {selectedIds.map(id => {
            const p = productsById.get(id);
            return (
              <span key={id} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 bg-black text-white text-xs rounded-full max-w-[220px]">
                <span className="truncate">{p?.name ?? 'Producto eliminado'}</span>
                <button type="button" onClick={() => toggle(id)} aria-label={`Quitar ${p?.name ?? 'producto'}`}
                  className="p-0.5 rounded-full hover:bg-white/20 flex-shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input aria-label="Buscar producto" className={inputClass + ' pl-9'} placeholder="Buscar por nombre o código"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {usedCategories.length > 1 && (
          <select aria-label="Filtrar por categoría" className={inputClass + ' sm:w-48'}
            value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Todas las categorías</option>
            {usedCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 px-0.5">
        <span>
          {visible.length} de {products.length} producto{products.length !== 1 ? 's' : ''}
          {' · '}<strong className="text-gray-800">{selectedIds.length} seleccionado{selectedIds.length !== 1 ? 's' : ''}</strong>
        </span>
        {visible.length > 0 && (
          <button type="button" onClick={allVisibleSelected ? unselectVisible : selectVisible}
            className="font-bold text-gray-800 hover:underline">
            {allVisibleSelected ? 'Quitar todos' : 'Seleccionar todos'}
          </button>
        )}
      </div>

      {/* Lista */}
      <ul className="border border-gray-100 rounded-sm max-h-64 overflow-y-auto divide-y divide-gray-50">
        {visible.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-gray-400">No hay productos que coincidan con el filtro.</li>
        ) : visible.map(p => {
          const others = otherPromotionsByProduct.get(p.id);
          return (
            <li key={p.id}>
              <label className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${selected.has(p.id) ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                <input type="checkbox" className="w-4 h-4 accent-black flex-shrink-0"
                  checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
                {p.images?.[0]
                  ? <img src={p.images[0]} alt="" className="w-10 h-10 object-contain rounded-sm border border-gray-100 flex-shrink-0 bg-white" />
                  : <span className="w-10 h-10 rounded-sm bg-gray-100 flex-shrink-0" />}
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-gray-800 truncate">{p.name}</span>
                  <span className="block text-[11px] text-gray-400 truncate">
                    {p.productCode && `#${p.productCode}`}
                    {p.stock !== undefined && ` · ${p.stock} en stock`}
                  </span>
                  {others && (
                    <span className="block text-[11px] text-amber-700 truncate" title={others.join(', ')}>
                      También en: {others.join(', ')}
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-600 font-medium flex-shrink-0">${p.sellingPrice.toLocaleString('es-CO')}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
