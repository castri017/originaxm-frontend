import { Cuboid, Flame, ThermometerSnowflake, type LucideIcon } from 'lucide-react';
import { MAX_THERMAL_HOURS, THERMAL_FIELDS, hasThermalHours, type ThermalHours, type ThermalKey } from './thermal';

const ICONS: Record<ThermalKey, { icon: LucideIcon; tone: string; bg: string }> = {
  coldHours: { icon: ThermometerSnowflake, tone: 'text-thermal-cold', bg: 'bg-thermal-cold/10' },
  hotHours:  { icon: Flame,                tone: 'text-thermal-hot',  bg: 'bg-thermal-hot/10'  },
  iceHours:  { icon: Cuboid,               tone: 'text-thermal-ice',  bg: 'bg-thermal-ice/10'  },
};

const present = (p: ThermalHours) => THERMAL_FIELDS.filter(({ key }) => p[key] != null);

/** Fila compacta de la ficha de producto: una pastilla por cada dato registrado. 0 h = no apto. */
export function ThermalSpecs({ product }: { product: ThermalHours }) {
  if (!hasThermalHours(product)) return null;

  return (
    <section aria-label="Rendimiento térmico" className="flex flex-wrap gap-2">
      {present(product).map(({ key, label }) => {
        const { icon: Icon, tone, bg } = ICONS[key];
        const hours = product[key] ?? 0;
        return (
          <div key={key} className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full ${hours > 0 ? bg : 'bg-brand-sand-dark'}`}>
            <span className="w-7 h-7 rounded-full bg-brand-sand flex items-center justify-center">
              <Icon className={`w-4 h-4 ${hours > 0 ? tone : 'text-brand-muted'}`} aria-hidden="true" />
            </span>
            {hours > 0 ? (
              <span className="text-[13px] text-brand-charcoal-dark leading-none">
                <strong className="font-display font-extrabold text-[15px]">{hours} h</strong> {label.toLowerCase()}
              </span>
            ) : (
              <span className="text-[12.5px] text-brand-muted leading-none">No apto {label === 'Calor' ? 'para calor' : label.toLowerCase()}</span>
            )}
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
