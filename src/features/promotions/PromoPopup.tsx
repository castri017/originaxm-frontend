import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { fetchActivePromotions } from './api';
import { getPromotionTarget } from './pricing';
import type { Promotion } from './types';

/** Rutas donde el popup interrumpiría una tarea en curso. */
const HIDDEN_ROUTES = ['/admin', '/checkout', '/payment-result', '/login'];
/** Pequeña espera para no tapar la primera pintura de la página. */
const OPEN_DELAY_MS = 1200;
const SEEN_KEY_PREFIX = 'originaxm-promo-seen-';

function wasSeen(id: string): boolean {
  try { return sessionStorage.getItem(SEEN_KEY_PREFIX + id) === '1'; }
  catch { return false; }
}

function markSeen(id: string): void {
  try { sessionStorage.setItem(SEEN_KEY_PREFIX + id, '1'); }
  catch { /* sin storage disponible: el popup puede volver a salir, no es crítico */ }
}

/** La promoción más reciente es la que se anuncia. */
function pickPromotion(promotions: Promotion[]): Promotion | null {
  const sorted = [...promotions].sort((a, b) => b.startDate.localeCompare(a.startDate));
  return sorted[0] ?? null;
}

export default function PromoPopup() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const isHiddenRoute = HIDDEN_ROUTES.some(route => pathname.startsWith(route));

  // Carga la promoción una sola vez por montaje.
  useEffect(() => {
    const controller = new AbortController();
    fetchActivePromotions(controller.signal)
      .then(list => setPromotion(pickPromotion(list)))
      .catch(() => { /* sin promociones: no se muestra nada */ });
    return () => controller.abort();
  }, []);

  // Abre el popup cuando hay promoción, no se ha visto y la ruta lo permite.
  useEffect(() => {
    if (!promotion || isHiddenRoute || wasSeen(promotion.id)) return;
    const timer = setTimeout(() => {
      previousFocus.current = document.activeElement as HTMLElement | null;
      setOpen(true);
      markSeen(promotion.id);
    }, OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [promotion, isHiddenRoute]);

  const close = useCallback(() => {
    setOpen(false);
    previousFocus.current?.focus?.();
  }, []);

  // Foco, Esc, trampa de foco y bloqueo del scroll de fondo mientras está abierto.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button, a[href]');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, close]);

  if (!open || !promotion || isHiddenRoute) return null;

  const goToPromotion = () => {
    setOpen(false);
    navigate(getPromotionTarget(promotion));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brand-charcoal-dark/60 backdrop-blur-[2px]"
      onClick={close}>
      <div
        ref={dialogRef}
        role="dialog" aria-modal="true" aria-labelledby="promo-popup-title"
        className="relative w-full sm:max-w-md bg-brand-sand shadow-[0_30px_80px_rgba(28,26,22,0.35)] max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button ref={closeRef} onClick={close} aria-label="Cerrar promoción"
          className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center bg-brand-sand/90 text-brand-charcoal-dark hover:bg-brand-sand transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="relative">
          <img src={promotion.imageUrl} alt={promotion.title}
            className="w-full aspect-[4/3] object-cover bg-brand-sand-dark" />
          <span className="absolute bottom-0 left-0 px-4 py-2 bg-brand-copper-light text-brand-charcoal-dark font-display font-extrabold text-[28px] leading-none tracking-[-0.02em]">
            -{promotion.discountPercent}%
          </span>
        </div>

        <div className="px-6 pt-5 pb-6 flex flex-col gap-3">
          <span className="meta-label">Promoción por tiempo limitado</span>
          <h2 id="promo-popup-title" className="font-display font-extrabold text-[24px] leading-tight tracking-[-0.02em] text-brand-charcoal-dark">
            {promotion.title}
          </h2>
          {promotion.description && (
            <p className="text-[14.5px] text-brand-charcoal-light">{promotion.description}</p>
          )}
          <button onClick={goToPromotion} className="btn-primary w-full mt-2">
            {promotion.ctaText}
          </button>
          <button onClick={close} className="text-[13px] text-brand-muted hover:text-brand-charcoal transition-colors py-1">
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
