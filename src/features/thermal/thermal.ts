/** Horas que un producto mantiene la bebida fría, caliente o con hielo (API: ProductDto). */
export interface ThermalHours {
  coldHours?: number | null;
  hotHours?: number | null;
  iceHours?: number | null;
}

export type ThermalKey = keyof ThermalHours;

/** Mismo límite que la API (ProductLimits.MaxThermalHours): una semana. */
export const MAX_THERMAL_HOURS = 168;

export const THERMAL_FIELDS: { key: ThermalKey; label: string }[] = [
  { key: 'coldHours', label: 'Frío' },
  { key: 'hotHours',  label: 'Calor' },
  { key: 'iceHours',  label: 'Con hielo' },
];

export const hasThermalHours = (p: ThermalHours) =>
  THERMAL_FIELDS.some(({ key }) => p[key] != null);

/** Valor del input del admin → número para la API ('' o inválido = sin dato). */
export function parseHours(value: string): number | null {
  if (value.trim() === '') return null;
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= 0 && n <= MAX_THERMAL_HOURS ? n : null;
}

export const hoursToInput = (value?: number | null) => (value == null ? '' : String(value));
