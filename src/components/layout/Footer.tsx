import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle, ShieldCheck } from 'lucide-react';
import { SITE, whatsappLink } from '../../config/site';

const SOCIAL_LINK =
  'w-9 h-9 flex items-center justify-center border border-brand-charcoal hover:border-brand-copper hover:text-brand-copper-light transition-colors';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

/** Guía en PDF para identificar un termo Stanley original (vive en /public/guias). */
const GUIA_TERMO_ORIGINAL = '/guias/stanley-original.pdf';

export default function Footer() {
  return (
    <footer className="bg-brand-charcoal-dark text-brand-sand-dark pt-12 pb-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 pb-10 border-b border-brand-charcoal">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <h3 className="font-display font-extrabold text-lg tracking-[0.18em] text-brand-sand">OriginAXM</h3>
            <p className="text-sm leading-relaxed text-brand-sand-dark/70 max-w-[280px]">
              Transformando tu estilo con la fuerza del águila. Ropa, accesorios y el espíritu de Alexander &amp; Maria.
            </p>
            <div className="flex gap-2.5 mt-1">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={SOCIAL_LINK}>
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href={SITE.social.instagram.url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={SOCIAL_LINK}>
                <Instagram className="w-4 h-4" />
              </a>
              <a href={SITE.social.facebook.url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={SOCIAL_LINK}>
                <Facebook className="w-4 h-4" />
              </a>
              <a href={SITE.social.tiktok.url} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={SOCIAL_LINK}>
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
            <p className="text-sm text-brand-sand-dark/70">
              WhatsApp{' '}
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-brand-copper-light transition-colors">
                {SITE.whatsapp.display}
              </a>
              <br />
              Armenia, Quindío · Colombia
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-muted">Tienda</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-brand-sand-dark/85">
              <li><Link to="/catalog" className="hover:text-brand-copper-light transition-colors">Todos los productos</Link></li>
              <li><Link to="/#novedades" className="hover:text-brand-copper-light transition-colors">Novedades</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-muted">Ayuda</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-brand-sand-dark/85">
              <li><Link to="/about" className="hover:text-brand-copper-light transition-colors">Sobre Nosotros</Link></li>
              <li><Link to="/faq" className="hover:text-brand-copper-light transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link to="/shipping" className="hover:text-brand-copper-light transition-colors">Envíos y Devoluciones</Link></li>
              <li><Link to="/contact" className="hover:text-brand-copper-light transition-colors">Contacto</Link></li>
              <li><Link to="/terms" className="hover:text-brand-copper-light transition-colors">Términos y condiciones</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-copper-light transition-colors">Política de privacidad</Link></li>
              <li><Link to="/warranty" className="hover:text-brand-copper-light transition-colors">Garantía</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-muted">Cómo compramos</h4>
            <p className="text-sm leading-relaxed text-brand-sand-dark/85">
              Traemos productos originales. Los pedidos internacionales llegan en 10 a 15 días con seguimiento.
            </p>
            <Link to="/shipping" className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-copper-light hover:text-brand-copper transition-colors">
              Ver el paso a paso
            </Link>
            <a
              href={GUIA_TERMO_ORIGINAL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex w-fit items-center gap-2 border border-brand-copper px-4 py-2.5 text-[13px] font-semibold text-brand-copper-light hover:bg-brand-copper hover:text-brand-charcoal-dark transition-colors"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Detecta tu termo original
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-2 pt-6 font-mono text-[10.5px] tracking-[0.08em] text-brand-muted">
          <p>&copy; {new Date().getFullYear()} OriginAXM. Todos los derechos reservados.</p>
          <p>Pago seguro · Tarjeta, PSE o contra entrega</p>
        </div>
      </div>
    </footer>
  );
}
