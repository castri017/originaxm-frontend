import { useEffect } from 'react';
import { SITE } from '../config/site';

interface SeoProps {
  /** Título de la página; se le agrega el nombre de la tienda. Sin título usa el de inicio. */
  title?: string;
  description?: string;
  /** Ruta canónica, p. ej. `/contact`. */
  path?: string;
  /** Imagen para redes sociales (URL absoluta o ruta del sitio). */
  image?: string;
  type?: 'website' | 'product';
  /** Páginas privadas (carrito, perfil, admin…) que no deben indexarse. */
  noindex?: boolean;
  /** Datos estructurados (schema.org). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const DEFAULT_TITLE = `${SITE.name} | Termos Stanley originales en Colombia`;
const DEFAULT_IMAGE = `${SITE.url}/logo.png`;
const JSON_LD_ID = 'seo-json-ld';

function absolute(url: string): string {
  return url.startsWith('http') ? url : `${SITE.url}${url.startsWith('/') ? '' : '/'}${url}`;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Actualiza título, descripción, canonical, Open Graph y datos estructurados de la página.
 * Se hace sobre las etiquetas de `index.html` para no duplicarlas; al salir de la página
 * vuelven los valores por defecto.
 */
export default function Seo({
  title,
  description = SITE.description,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
}: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE.name}` : DEFAULT_TITLE;
  const url = `${SITE.url}${path}`;
  const imageUrl = absolute(image);
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertCanonical(url);
    upsertMeta('property', 'og:type', type === 'product' ? 'product' : 'website');
    upsertMeta('property', 'og:site_name', SITE.name);
    upsertMeta('property', 'og:locale', SITE.locale);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);
  }, [fullTitle, description, url, imageUrl, type, noindex]);

  useEffect(() => {
    if (!jsonLdText) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = JSON_LD_ID;
    script.text = jsonLdText;
    document.head.appendChild(script);
    return () => script.remove();
  }, [jsonLdText]);

  // Al salir de la página se restauran los valores por defecto (rutas sin <Seo>).
  useEffect(() => {
    return () => {
      document.title = DEFAULT_TITLE;
      upsertMeta('name', 'description', SITE.description);
      upsertMeta('name', 'robots', 'index, follow');
      upsertCanonical(`${SITE.url}/`);
      upsertMeta('property', 'og:type', 'website');
      upsertMeta('property', 'og:title', DEFAULT_TITLE);
      upsertMeta('property', 'og:description', SITE.description);
      upsertMeta('property', 'og:url', `${SITE.url}/`);
      upsertMeta('property', 'og:image', DEFAULT_IMAGE);
      upsertMeta('name', 'twitter:title', DEFAULT_TITLE);
      upsertMeta('name', 'twitter:description', SITE.description);
      upsertMeta('name', 'twitter:image', DEFAULT_IMAGE);
    };
  }, []);

  return null;
}
