import { Cuboid, Flame, ThermometerSnowflake, type LucideIcon } from 'lucide-react';
import { MAX_THERMAL_HOURS, THERMAL_FIELDS, hasThermalHours, type ThermalHours, type ThermalKey } from './thermal';

const ICONS: Record<ThermalKey, { icon: LucideIcon; tone: string }> = {
  coldHours: { icon: ThermometerSnowflake, tone: 'text-thermal-cold' },
  hotHours:  { icon: Flame,                tone: 'text-thermal-hot' },
  iceHours:  { icon: Cuboid,               tone: 'text-thermal-ice' },
};

const present = (p: ThermalHours) => THERMAL_FIELDS.filter(({ key }) => p[key] != null);

/**
 * Fila de la ficha de producto: tres columnas fijas (frío, calor, hielo) para que alineen con la
 * fila de especificaciones de abajo. Sin dato la columna queda vacía; 0 h se muestra como "No apto".
 */
export function ThermalSpecs({ product }: { product: ThermalHours }) {
  if (!hasThermalHours(product)) return null;

  return (
    <section aria-label="Rendimiento térmico" className="grid grid-cols-3 divide-x divide-brand-line">
      {THERMAL_FIELDS.map(({ key, label }) => {
        const { icon: Icon, tone } = ICONS[key];
        const hours = product[key];
        if (hours == null) return <div key={key} aria-hidden="true" />;
        const active = hours > 0;
        return (
          <div key={key} className="flex flex-col items-center text-center gap-1 px-2 py-3">
            <Icon className={`w-5 h-5 ${active ? tone : 'text-brand-muted'}`} aria-hidden="true" />
            {active ? (
              <span className="font-display font-extrabold text-[20px] leading-none text-brand-charcoal-dark">
                {hours}<span className="text-[13px] font-bold ml-0.5">h</span>
              </span>
            ) : (
              <span className="font-display font-bold text-[14px] leading-none text-brand-muted">No apto</span>
            )}
            <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-brand-muted">{label}</span>
          </div>
        );
      })}
    </section>
  );
}

/** Resumen compacto para la tarjeta del catálogo. */
export function ThermalSummary({ product }: { product: ThermalHours }) {
  if (!hasThermalHours(product)) return null;
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-brand-charcoal-light">
      {present(product).filter(({ key }) => (product[key] ?? 0) > 0).map(({ key, label }) => {
        const { icon: Icon, tone } = ICONS[key];
        return (
          <span key={key} className="inline-flex items-center gap-1" title={`${label}: ${product[key]} horas`}>
            <Icon className={`w-3.5 h-3.5 ${tone}`} aria-hidden="true" />
            <span className="sr-only">{label}:</span>
            {product[key]} h
          </span>
        );
      })}
    </span>
  );
}

interface FieldsProps {
  values: Record<ThermalKey, string>;
  onChange: (key: ThermalKey, value: string) => void;
}

/** Campos del formulario de producto en el admin. Vacío = el producto no aplica. */
export function ThermalHoursFields({ values, onChange }: FieldsProps) {
  return (
    <div className="mb-4">
      <p className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
        Rendimiento térmico <span className="normal-case font-normal tracking-normal text-gray-400">(horas, déjalo vacío si no aplica)</span>
      </p>
      <div className="grid grid-cols-3 gap-4">
        {THERMAL_FIELDS.map(({ key, label }) => {
          const { icon: Icon, tone } = ICONS[key];
          return (
            <label key={key} className="block">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${tone}`} aria-hidden="true" /> {label}
              </span>
              <input
                type="number" inputMode="numeric" min={0} max={MAX_THERMAL_HOURS} step={1}
                value={values[key]}
                onChange={e => onChange(key, e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ej: 24"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
