/** Datos públicos de la tienda: una sola fuente para contacto, redes y SEO. */
export const SITE = {
  name: 'OriginAXM',
  url: 'https://originaxm.com',
  locale: 'es_CO',
  description:
    'Termos, botellas y vasos Stanley 100% originales en Colombia. Pedidos internacionales con seguimiento, envíos a todo el país y pago seguro.',
  email: 'originaxm@gmail.com',
  whatsapp: {
    number: '573117473209',
    display: '+57 311 747 3209',
  },
  social: {
    instagram: { url: 'https://www.instagram.com/originaxm/', handle: '@originaxm' },
    facebook: { url: 'https://www.facebook.com/share/1J4EMfurcL/', handle: 'OriginAXM' },
    tiktok: { url: 'https://www.tiktok.com/@originaxm', handle: '@originaxm' },
  },
} as const;

/** Enlace de WhatsApp con mensaje opcional prellenado. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsapp.number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Tiempos de entrega oficiales (los mismos de los Términos y condiciones).
 * Cámbialos solo aquí: los usan Envíos, FAQ, carrito, checkout, fichas y términos.
 */
export const DELIVERY = {
  main:     '8 a 10 días hábiles',
  special:  '10 a 15 días hábiles',
  mainShort:    '8-10 días hábiles',
  specialShort: '10-15 días hábiles',
} as const;

/**
 * Condiciones de envío y devolución publicadas en los datos estructurados de Google
 * (deben coincidir con el carrito, el checkout, Envíos y devoluciones y los Términos).
 */
export const SHIPPING = {
  cost: 15000,            // COP, tarifa nacional
  freeFrom: 300000,       // COP, envío gratis desde este valor
  handlingDays: { min: 0, max: 1 },
  transitDays:  { min: 8, max: 15 }, // días hábiles: 8-10 principales, 10-15 especiales
} as const;

export const RETURNS = {
  /** Derecho de retracto: 5 días hábiles tras la entrega (Ley 1480, art. 47). */
  days: 5,
} as const;
