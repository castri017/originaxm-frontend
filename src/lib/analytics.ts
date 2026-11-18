/**
 * Medición del sitio: Google Analytics 4 (gtag.js) y píxel de TikTok.
 * GA4 solo se activa si existe VITE_GA_MEASUREMENT_ID (formato G-XXXXXXXXXX) y
 * TikTok si existe VITE_TIKTOK_PIXEL_ID; sin ellas las funciones son no-ops,
 * así que en local no se envían datos.
 */
import { initTikTok, ttPageView, ttTrack, type TikTokContent } from './tiktok';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const CURRENCY = 'COP';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_variant?: string;
  item_category?: string;
  /** Código del producto (ProductCode): es el id del catálogo en Merchant Center y TikTok. */
  sku?: string;
}

/** Los ítems de GA4 no aceptan campos desconocidos: se quita `sku` antes de enviarlos. */
function gaItem(item: AnalyticsItem): Omit<AnalyticsItem, 'sku'> {
  const ga: Partial<AnalyticsItem> = { ...item };
  delete ga.sku;
  return ga as Omit<AnalyticsItem, 'sku'>;
}

function ttContents(items: AnalyticsItem[]): TikTokContent[] {
  return items.map(i => ({
    content_id: i.sku || i.item_id,
    content_name: i.item_name,
    price: i.price,
    quantity: i.quantity ?? 1,
  }));
}

let initialized = false;

export function initAnalytics(): void {
  initTikTok();
  if (!GA_ID || initialized || typeof document === 'undefined') return;
  initialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag exige que se empuje el objeto `arguments`, no un arreglo.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  // La SPA envía page_view manualmente en cada cambio de ruta (AnalyticsTracker).
  window.gtag('config', GA_ID, { send_page_view: false });
}

export function trackPageView(path: string): void {
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
  ttPageView();
}

export function trackViewItem(item: AnalyticsItem): void {
  window.gtag?.('event', 'view_item', {
    currency: CURRENCY,
    value: item.price,
    items: [gaItem(item)],
  });
  ttTrack('ViewContent', ttContents([item]), item.price, CURRENCY);
}

export function trackAddToCart(item: AnalyticsItem): void {
  const value = item.price * (item.quantity ?? 1);
  window.gtag?.('event', 'add_to_cart', {
    currency: CURRENCY,
    value,
    items: [gaItem(item)],
  });
  ttTrack('AddToCart', ttContents([item]), value, CURRENCY);
}

export function trackBeginCheckout(items: AnalyticsItem[], value: number): void {
  window.gtag?.('event', 'begin_checkout', { currency: CURRENCY, value, items: items.map(gaItem) });
  ttTrack('InitiateCheckout', ttContents(items), value, CURRENCY);
}

export interface PurchasePayload {
  transaction_id: string;
  value: number;
  shipping: number;
  items: AnalyticsItem[];
}

export function trackPurchase(p: PurchasePayload): void {
  window.gtag?.('event', 'purchase', { currency: CURRENCY, ...p, items: p.items.map(gaItem) });
  // event_id = número de pedido: evita contar dos veces la misma compra.
  ttTrack('Purchase', ttContents(p.items), p.value, CURRENCY, p.transaction_id);
}

/** Compra pendiente de confirmar (pago con redirección): se guarda para reportarla al volver. */
const PENDING_KEY = 'ga-pending-purchase';

export function savePendingPurchase(p: PurchasePayload): void {
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(p)); } catch { /* sin storage */ }
}

/** Reporta la compra guardada una sola vez y la elimina. */
export function flushPendingPurchase(orderNumber?: string): void {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_KEY);
    const p = JSON.parse(raw) as PurchasePayload;
    trackPurchase({ ...p, transaction_id: orderNumber || p.transaction_id });
  } catch { /* datos corruptos: se ignoran */ }
}
