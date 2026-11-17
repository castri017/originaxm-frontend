/**
 * Google Analytics 4 (gtag.js).
 * Solo se activa si existe VITE_GA_MEASUREMENT_ID (formato G-XXXXXXXXXX);
 * sin esa variable todas las funciones son no-ops, así que en local no envía datos.
 */
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
}

let initialized = false;

export function initAnalytics(): void {
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
}

export function trackViewItem(item: AnalyticsItem): void {
  window.gtag?.('event', 'view_item', {
    currency: CURRENCY,
    value: item.price,
    items: [item],
  });
}

export function trackAddToCart(item: AnalyticsItem): void {
  window.gtag?.('event', 'add_to_cart', {
    currency: CURRENCY,
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackBeginCheckout(items: AnalyticsItem[], value: number): void {
  window.gtag?.('event', 'begin_checkout', { currency: CURRENCY, value, items });
}

export interface PurchasePayload {
  transaction_id: string;
  value: number;
  shipping: number;
  items: AnalyticsItem[];
}

export function trackPurchase(p: PurchasePayload): void {
  window.gtag?.('event', 'purchase', { currency: CURRENCY, ...p });
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
