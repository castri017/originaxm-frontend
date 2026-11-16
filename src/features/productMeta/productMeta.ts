/** Peso y etiquetas SEO opcionales de un producto (API: ProductDto). */
export interface ProductMeta {
  weightGrams?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export type ProductMetaKey = 'weightGrams' | 'seoTitle' | 'seoDescription';

/** Mismos límites que la API (ProductLimits). */
export const MIN_WEIGHT_GRAMS = 1;
export const MAX_WEIGHT_GRAMS = 50_000;
export const MAX_SEO_TITLE = 70;
export const MAX_SEO_DESCRIPTION = 160;

/** Valor del input del admin → gramos para la API ('' o fuera de rango = sin dato). */
export function parseWeight(value: string): number | null {
  if (value.trim() === '') return null;
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= MIN_WEIGHT_GRAMS && n <= MAX_WEIGHT_GRAMS ? n : null;
}

export const weightToInput = (value?: number | null) => (value == null ? '' : String(value));

/** Texto opcional del input → valor para la API (vacío = null). */
export const textOrNull = (value: string): string | null => (value.trim() === '' ? null : value.trim());

/** 750 → "750 g", 1250 → "1,25 kg". */
export function formatWeight(grams?: number | null): string {
  if (grams == null) return '';
  if (grams < 1000) return `${grams} g`;
  const kg = grams / 1000;
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(kg)} kg`;
}
