/**
 * Píxel de TikTok (TikTok Ads Manager → Events Manager).
 * Solo se activa si existe VITE_TIKTOK_PIXEL_ID; sin esa variable todas las
 * funciones son no-ops, así que en local no envía datos.
 *
 * El `content_id` de cada producto es su código (ProductCode), el mismo `id`
 * del feed de Google Merchant Center que TikTok importa como catálogo: así los
 * eventos del sitio se cruzan con los productos del catálogo.
 */
const PIXEL_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID as string | undefined;

interface Ttq {
  page: () => void;
  track: (event: string, params?: Record<string, unknown>, options?: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    ttq?: Ttq;
  }
}

export interface TikTokContent {
  content_id: string;
  content_name: string;
  price: number;
  quantity: number;
}

let initialized = false;

/**
 * Código base oficial de TikTok, sin el `ttq.page()` inicial: la SPA reporta
 * cada página manualmente desde AnalyticsTracker.
 */
function baseCode(pixelId: string): string {
  return `!function (w, d, t) {
w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
ttq.load(${JSON.stringify(pixelId)});
}(window, document, 'ttq');`;
}

export function initTikTok(): void {
  if (!PIXEL_ID || initialized || typeof document === 'undefined') return;
  initialized = true;
  const script = document.createElement('script');
  script.text = baseCode(PIXEL_ID);
  document.head.appendChild(script);
}

export function ttPageView(): void {
  window.ttq?.page();
}

export function ttTrack(
  event: 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase',
  contents: TikTokContent[],
  value: number,
  currency: string,
  eventId?: string,
): void {
  if (!window.ttq || contents.length === 0) return;
  window.ttq.track(
    event,
    { contents, content_type: 'product', value, currency },
    eventId ? { event_id: eventId } : undefined,
  );
}
