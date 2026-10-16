import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, Edit, Loader2, Megaphone, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { API } from '../../config/api';
import { deletePromotion, fetchPromotions } from './api';
import { getPromotionStatus } from './pricing';
import PromotionForm from './PromotionForm';
import type { CategoryOption, PromotionProductOption } from './ProductPicker';
import type { Promotion, PromotionStatus } from './types';

const STATUS_STYLES: Record<PromotionStatus, { label: string; className: string }> = {
  active:    { label: 'Activa',     className: 'bg-green-100 text-green-800 border-green-200' },
  scheduled: { label: 'Programada', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  expired:   { label: 'Vencida',    className: 'bg-gray-100 text-gray-500 border-gray-200' },
  inactive:  { label: 'Inactiva',   className: 'bg-amber-100 text-amber-800 border-amber-200' },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

export default function PromotionsAdmin() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<PromotionProductOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // Promociones y productos se cargan por separado: si falla una consulta, la otra sigue sirviendo.
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPromotions(await fetchPromotions());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las promociones.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError('');
    try {
      const [prodRes, catRes] = await Promise.all([fetch(`${API}/api/products`), fetch(`${API}/api/categories`)]);
      if (!prodRes.ok) throw new Error('No se pudieron cargar los productos.');
      setProducts(await prodRes.json());
      setCategories(catRes.ok ? await catRes.json() : []);
    } catch (err) {
      setProductsError(err instanceof Error && err.message !== 'Failed to fetch'
        ? err.message
        : 'No se pudieron cargar los productos. Revisa tu conexión.');
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => { load(); loadProducts(); }, [load, loadProducts]);

  // Producto → otras promociones activas o programadas que lo incluyen (excluye la que se edita).
  const otherPromotionsByProduct = useMemo(() => {
    const map = new Map<string, string[]>();
    promotions
      .filter(p => p.id !== editing?.id)
      .filter(p => ['active', 'scheduled'].includes(getPromotionStatus(p)))
      .forEach(p => p.productIds.forEach(id => map.set(id, [...(map.get(id) ?? []), p.title])));
    return map;
  }, [promotions, editing]);

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (promotion: Promotion) => { setEditing(promotion); setFormOpen(true); };
  const closeForm = useCallback(() => setFormOpen(false), []);
  const handleSaved = () => { setFormOpen(false); load(); };

  const handleDelete = async (promotion: Promotion) => {
    if (!confirm(`¿Eliminar la promoción "${promotion.title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deletePromotion(promotion.id);
      setPromotions(prev => prev.filter(p => p.id !== promotion.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la promoción.');
    }
  };

  const productName = (id: string) => products.find(p => p.id === id)?.name;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-black">Promociones</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            La promoción vigente más reciente se muestra en un popup al entrar a la tienda.
          </p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors uppercase tracking-wide">
          <Plus className="w-4 h-4" /> Nueva promoción
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-sm text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={load} className="flex items-center gap-1 text-xs font-bold hover:underline">
            <RefreshCw className="w-3.5 h-3.5" /> Reintentar
          </button>
        </div>
      )}

      <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-5">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando promociones...
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Aún no hay promociones.</p>
            <p className="text-xs mt-1 text-gray-300">Crea una para mostrarla en el popup de la tienda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {promotions.map(promo => {
              const status = STATUS_STYLES[getPromotionStatus(promo)];
              const names = promo.productIds.map(productName).filter(Boolean);
              return (
                <article key={promo.id} className="rounded-sm border border-gray-100 overflow-hidden flex flex-col">
                  <div className="relative">
                    <img src={promo.imageUrl} alt={promo.title} className="w-full aspect-[4/3] object-cover bg-gray-50" />
                    <span className="absolute top-2 left-2 px-2.5 py-1 text-sm font-extrabold bg-black text-white rounded-sm">
                      -{promo.discountPercent}%
                    </span>
                    <span className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold border rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <h2 className="font-bold text-gray-900">{promo.title}</h2>
                    <p className="flex items-center gap-1.5 text-xs text-gray-500">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {formatDate(promo.startDate)} – {formatDate(promo.endDate)}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {promo.productIds.length} producto{promo.productIds.length !== 1 ? 's' : ''}
                      {names.length > 0 && `: ${names.join(', ')}`}
                    </p>
                    <div className="flex gap-2 mt-auto pt-2">
                      <button onClick={() => openEdit(promo)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold border border-gray-200 rounded-full hover:bg-gray-50">
                        <Edit className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button onClick={() => handleDelete(promo)} aria-label={`Eliminar ${promo.title}`}
                        className="px-3 py-2 text-red-500 border border-gray-200 rounded-full hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {formOpen && (
        <PromotionForm
          promotion={editing}
          products={{ items: products, categories, loading: productsLoading, error: productsError, reload: loadProducts }}
          otherPromotionsByProduct={otherPromotionsByProduct}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
