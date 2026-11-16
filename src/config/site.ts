/** Datos públicos de la tienda: una sola fuente para contacto, redes y SEO. */
export const SITE = {
  name: 'OriginAXM',
  url: 'https://originaxm.com',
  locale: 'es_CO',
  description:
    'Termos, botellas y vasos Stanley 100% originales en Colombia. Pedidos internacionales con seguimiento, envíos a todo el país y pago seguro.',
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
