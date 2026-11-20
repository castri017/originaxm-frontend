/** Formato de la cartera: pesos colombianos y días de Colombia. */

export const money = (value: number) =>
  `$${Math.round(value).toLocaleString('es-CO')}`;

/**
 * Día de una fecha de la API como "YYYY-MM-DD". Las que traen zona (guardadas en UTC) se pasan a
 * hora de Colombia; las que no (vencimientos) ya son un día.
 */
export function dayOf(iso: string | null | undefined): string | null {
  if (!iso) return null;
  if (/Z$|[+-]\d\d:\d\d$/.test(iso)) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date(iso));
  }
  return iso.slice(0, 10);
}

/** "20 nov 2026". */
export function formatDay(iso: string | null | undefined): string {
  const day = dayOf(iso);
  if (!day) return '—';
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Hoy en Colombia como "YYYY-MM-DD", para los campos de fecha. */
export const todayInColombia = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
