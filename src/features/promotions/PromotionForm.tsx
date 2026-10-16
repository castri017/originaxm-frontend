import { useEffect, useState } from 'react';
import { AlertCircle, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { uploadPromotionImage, savePromotion } from './api';
import { DEFAULT_CTA_TEXT, PROMOTION_LIMITS, type Promotion, type PromotionInput } from './types';
import ProductPicker, { type CategoryOption, type PromotionProductOption } from './ProductPicker';

export interface ProductsState {
  items: PromotionProductOption[];
  categories: CategoryOption[];
  loading: boolean;
  error: string;
  reload: () => void;
}

interface Props {
  promotion: Promotion | null;
  products: ProductsState;
  otherPromotionsByProduct: Map<string, string[]>;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  title: string;
  description: string;
  imageUrl: string;
  discountPercent: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  ctaText: string;
  productIds: string[];
}

/** ISO (UTC) → "yyyy-mm-dd" en hora local, para <input type="date">. */
function toDateInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "yyyy-mm-dd" local → ISO; el inicio a las 00:00 y el fin a las 23:59:59. */
function fromDateInput(value: string, endOfDay: boolean): string {
  const [y, m, d] = value.split('-').map(Number);
  const date = endOfDay ? new Date(y, m - 1, d, 23, 59, 59) : new Date(y, m - 1, d, 0, 0, 0);
  return date.toISOString();
}

function initialState(promotion: Promotion | null): FormState {
  if (promotion) {
    return {
      title: promotion.title,
      description: promotion.description,
      imageUrl: promotion.imageUrl,
      discountPercent: String(promotion.discountPercent),
      startDate: toDateInput(promotion.startDate),
      endDate: toDateInput(promotion.endDate),
      isActive: promotion.isActive,
      ctaText: promotion.ctaText,
      productIds: promotion.productIds,
    };
  }
  const today = toDateInput(new Date().toISOString());
  return {
    title: '', description: '', imageUrl: '', discountPercent: '',
    startDate: today, endDate: today, isActive: true,
    ctaText: DEFAULT_CTA_TEXT, productIds: [],
  };
}

function validate(form: FormState): string | null {
  const discount = Number(form.discountPercent);
  if (!form.title.trim()) return 'El título es obligatorio.';
  if (!form.imageUrl) return 'Sube la imagen de la promoción.';
  if (!Number.isInteger(discount) || discount < PROMOTION_LIMITS.minDiscount || discount > PROMOTION_LIMITS.maxDiscount) {
    return `El descuento debe ser un número entero entre ${PROMOTION_LIMITS.minDiscount} y ${PROMOTION_LIMITS.maxDiscount}.`;
  }
  if (!form.startDate || !form.endDate) return 'Define las fechas de inicio y fin.';
  if (form.endDate < form.startDate) return 'La fecha de fin no puede ser anterior a la de inicio.';
  if (form.productIds.length === 0) return 'Selecciona al menos un producto.';
  return null;
}

const inputClass =
  'w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400';
const labelClass = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5';

export default function PromotionForm({ promotion, products, otherPromotionsByProduct, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(() => initialState(promotion));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleImage = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      setField('imageUrl', await uploadPromotionImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate(form);
    if (validationError) { setError(validationError); return; }

    const input: PromotionInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl,
      discountPercent: Number(form.discountPercent),
      startDate: fromDateInput(form.startDate, false),
      endDate: fromDateInput(form.endDate, true),
      isActive: form.isActive,
      ctaText: form.ctaText.trim() || DEFAULT_CTA_TEXT,
      productIds: form.productIds,
    };

    setError('');
    setSaving(true);
    try {
      await savePromotion(input, promotion?.id);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la promoción.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !saving && onClose()}>
      <div
        role="dialog" aria-modal="true" aria-labelledby="promotion-form-title"
        className="bg-white rounded-sm shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 id="promotion-form-title" className="text-lg font-extrabold text-black">
            {promotion ? 'Editar promoción' : 'Nueva promoción'}
          </h2>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Cerrar"
            className="p-1.5 text-gray-400 hover:text-black rounded-sm hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Imagen */}
          <div>
            <span className={labelClass}>Imagen de la promoción *</span>
            <label className={`relative flex items-center justify-center aspect-[4/3] max-h-64 w-full border-2 border-dashed border-gray-200 rounded-sm overflow-hidden cursor-pointer hover:border-gray-400 transition-colors ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="Vista previa de la promoción" className="w-full h-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-gray-400 text-sm">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  Haz clic para subir (PNG, JPG o WEBP)
                </span>
              )}
              {uploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </span>
              )}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImage(f); e.target.value = ''; }} />
            </label>
            {form.imageUrl && <p className="text-[11px] text-gray-400 mt-1">Haz clic en la imagen para reemplazarla.</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
            <div>
              <label htmlFor="promo-title" className={labelClass}>Título *</label>
              <input id="promo-title" className={inputClass} maxLength={PROMOTION_LIMITS.titleMaxLength}
                value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Ej: Semana del perfume" />
            </div>
            <div>
              <label htmlFor="promo-discount" className={labelClass}>Descuento % *</label>
              <input id="promo-discount" type="number" inputMode="numeric" className={inputClass}
                min={PROMOTION_LIMITS.minDiscount} max={PROMOTION_LIMITS.maxDiscount} step={1}
                value={form.discountPercent} onChange={e => setField('discountPercent', e.target.value)} placeholder="20" />
            </div>
          </div>

          <div>
            <label htmlFor="promo-description" className={labelClass}>Descripción</label>
            <textarea id="promo-description" rows={2} className={inputClass} maxLength={PROMOTION_LIMITS.descriptionMaxLength}
              value={form.description} onChange={e => setField('description', e.target.value)}
              placeholder="Texto corto que acompaña la promoción en el popup" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="promo-start" className={labelClass}>Inicio *</label>
              <input id="promo-start" type="date" className={inputClass}
                value={form.startDate} onChange={e => setField('startDate', e.target.value)} />
            </div>
            <div>
              <label htmlFor="promo-end" className={labelClass}>Fin *</label>
              <input id="promo-end" type="date" className={inputClass} min={form.startDate}
                value={form.endDate} onChange={e => setField('endDate', e.target.value)} />
            </div>
            <div>
              <label htmlFor="promo-cta" className={labelClass}>Texto del botón</label>
              <input id="promo-cta" className={inputClass} maxLength={PROMOTION_LIMITS.ctaMaxLength}
                value={form.ctaText} onChange={e => setField('ctaText', e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4 accent-black"
              checked={form.isActive} onChange={e => setField('isActive', e.target.checked)} />
            <span className="text-sm font-medium text-gray-700">Promoción activa</span>
          </label>

          {/* Productos */}
          <div>
            <span className={labelClass}>Productos en promoción *</span>
            <ProductPicker
              products={products.items}
              categories={products.categories}
              loading={products.loading}
              error={products.error}
              onRetry={products.reload}
              selectedIds={form.productIds}
              onChange={ids => setField('productIds', ids)}
              otherPromotionsByProduct={otherPromotionsByProduct}
            />
          </div>

          {error && (
            <div role="alert" className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-sm text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving || uploading}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors uppercase tracking-wide disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {promotion ? 'Guardar cambios' : 'Crear promoción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
