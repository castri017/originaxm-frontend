import { Scale, Search } from 'lucide-react';
import {
  MAX_SEO_DESCRIPTION, MAX_SEO_TITLE, MAX_WEIGHT_GRAMS, MIN_WEIGHT_GRAMS,
  type ProductMetaKey,
} from './productMeta';

interface Props {
  values: Record<ProductMetaKey, string>;
  onChange: (field: ProductMetaKey, value: string) => void;
}

const INPUT =
  'w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black';
const LABEL = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5';

function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={`text-[11px] tabular-nums ${over ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
      {value.length}/{max}
    </span>
  );
}

/** Peso y etiquetas SEO del producto en los formularios del admin. */
export function ProductMetaFields({ values, onChange }: Props) {
  return (
    <div className="mb-4 space-y-4">
      <label className="block max-w-xs">
        <span className={`${LABEL} flex items-center gap-1.5`}>
          <Scale className="w-3.5 h-3.5" aria-hidden="true" /> Peso (gramos)
          <span className="normal-case font-normal tracking-normal text-gray-400">opcional</span>
        </span>
        <input
          type="number" inputMode="numeric" min={MIN_WEIGHT_GRAMS} max={MAX_WEIGHT_GRAMS} step={1}
          value={values.weightGrams}
          onChange={e => onChange('weightGrams', e.target.value)}
          className={INPUT} placeholder="Ej: 750"
        />
      </label>

      <div>
        <p className={`${LABEL} flex items-center gap-1.5`}>
          <Search className="w-3.5 h-3.5" aria-hidden="true" /> Etiquetas SEO
          <span className="normal-case font-normal tracking-normal text-gray-400">
            (lo que se ve en Google; si las dejas vacías se generan solas)
          </span>
        </p>
        <div className="space-y-3">
          <label className="block">
            <span className="flex justify-between mb-1">
              <span className="text-[11px] font-semibold text-gray-500">Título SEO</span>
              <Counter value={values.seoTitle} max={MAX_SEO_TITLE} />
            </span>
            <input
              type="text" maxLength={MAX_SEO_TITLE}
              value={values.seoTitle}
              onChange={e => onChange('seoTitle', e.target.value)}
              className={INPUT} placeholder="Ej: Termo Stanley Quencher 40 oz original | OriginAXM"
            />
          </label>
          <label className="block">
            <span className="flex justify-between mb-1">
              <span className="text-[11px] font-semibold text-gray-500">Descripción SEO</span>
              <Counter value={values.seoDescription} max={MAX_SEO_DESCRIPTION} />
            </span>
            <textarea
              rows={2} maxLength={MAX_SEO_DESCRIPTION}
              value={values.seoDescription}
              onChange={e => onChange('seoDescription', e.target.value)}
              className={`${INPUT} resize-none`}
              placeholder="Resumen de 1 o 2 frases que invite a hacer clic en el resultado de búsqueda."
            />
          </label>
        </div>
      </div>
    </div>
  );
}
