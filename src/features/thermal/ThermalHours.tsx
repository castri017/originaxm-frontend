import { Cuboid, Flame, ThermometerSnowflake, type LucideIcon } from 'lucide-react';
import { MAX_THERMAL_HOURS, THERMAL_FIELDS, hasThermalHours, type ThermalHours, type ThermalKey } from './thermal';

const ICONS: Record<ThermalKey, { icon: LucideIcon; tone: string; bg: string }> = {
  coldHours: { icon: ThermometerSnowflake, tone: 'text-thermal-cold', bg: 'bg-thermal-cold/10' },
  hotHours:  { icon: Flame,                tone: 'text-thermal-hot',  bg: 'bg-thermal-hot/10'  },
  iceHours:  { icon: Cuboid,               tone: 'text-thermal-ice',  bg: 'bg-thermal-ice/10'  },
};

const present = (p: ThermalHours) => THERMAL_FIELDS.filter(({ key }) => p[key] != null);

/** Bloque destacado de la ficha de producto: una celda por cada dato registrado. */
export function ThermalSpecs({ product }: { product: ThermalHours }) {
  if (!hasThermalHours(product)) return null;
  const fields = present(product);

  return (
    <section aria-label="Rendimiento térmico" className="flex flex-col gap-2.5">
      <span className="meta-label">Rendimiento térmico</span>
      <div className={`grid gap-[1px] bg-brand-line border border-brand-line ${fields.length === 3 ? 'grid-cols-3' : fields.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {fields.map(({ key, label }) => {
          const { icon: Icon, tone, bg } = ICONS[key];
          return (
            <div key={key} className="bg-brand-sand px-3 py-4 flex flex-col items-center text-center gap-2">
              <span className={`w-10 h-10 rounded-full flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${tone}`} aria-hidden="true" />
              </span>
              <span className="font-display font-extrabold text-[24px] leading-none text-brand-charcoal-dark">
                {product[key]}<span className="text-[14px] font-bold ml-0.5">h</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-brand-muted">{label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Resumen compacto para la tarjeta del catálogo. */
export function ThermalSummary({ product }: { product: ThermalHours }) {
  if (!hasThermalHours(product)) return null;
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-brand-charcoal-light">
      {present(product).map(({ key, label }) => {
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
