import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from '../SocialIcons';
import { SITE, whatsappLink } from '../../config/site';

const SOCIAL_LINK =
  'w-9 h-9 flex items-center justify-center border border-brand-charcoal hover:border-brand-copper hover:-translate-y-0.5 transition-all';

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
                <WhatsAppIcon className="w-[18px] h-[18px]" />
              </a>
              <a href={SITE.social.instagram.url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={SOCIAL_LINK}>
                <InstagramIcon className="w-[18px] h-[18px]" />
              </a>
              <a href={SITE.social.facebook.url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={SOCIAL_LINK}>
                <FacebookIcon className="w-[18px] h-[18px]" />
              </a>
              <a href={SITE.social.tiktok.url} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={SOCIAL_LINK}>
                <TikTokIcon className="w-[18px] h-[18px]" />
              </a>
            </div>
            <p className="text-sm text-brand-sand-dark/70">
              WhatsApp{' '}
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-brand-copper-light transition-colors">
                {SITE.whatsapp.display}
              </a>
              <br />
              <a href={`mailto:${SITE.email}`} className="hover:text-brand-copper-light transition-colors">{SITE.email}</a>
              <br />
              Armenia, Quindío · Colombia
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-muted">Tienda</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-brand-sand-dark/85">
              <li><Link to="/catalog" className="hover:text-brand-copper-light transition-colors">Todos los productos</Link></li>
              <li><Link to="/#novedades" className="hover:text-brand-copper-light transition-colors">Novedades</Link></li>
              <li><Link to="/blog" className="hover:text-brand-copper-light transition-colors">Blog</Link></li>
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
