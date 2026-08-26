import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-charcoal-dark text-brand-sand-dark pt-12 pb-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 pb-10 border-b border-brand-charcoal">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <h3 className="font-display font-extrabold text-lg tracking-[0.18em] text-brand-sand">OrigenAXM</h3>
            <p className="text-sm leading-relaxed text-brand-sand-dark/70 max-w-[280px]">
              Transformando tu estilo con la fuerza del águila. Ropa, accesorios y el espíritu de Alexander &amp; Maria.
            </p>
            <div className="flex gap-2.5 mt-1">
              <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 flex items-center justify-center border border-brand-charcoal hover:border-brand-copper hover:text-brand-copper-light transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/originaxm/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 flex items-center justify-center border border-brand-charcoal hover:border-brand-copper hover:text-brand-copper-light transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-muted">Tienda</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-brand-sand-dark/85">
              <li><Link to="/catalog" className="hover:text-brand-copper-light transition-colors">Todos los productos</Link></li>
              <li><Link to="/catalog?category=novedades" className="hover:text-brand-copper-light transition-colors">Novedades</Link></li>
              <li><Link to="/catalog?category=ofertas" className="hover:text-brand-copper-light transition-colors">Ofertas Especiales</Link></li>
              <li><Link to="/catalog?category=accesorios" className="hover:text-brand-copper-light transition-colors">Accesorios</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-muted">Ayuda</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-brand-sand-dark/85">
              <li><Link to="/about" className="hover:text-brand-copper-light transition-colors">Sobre Nosotros</Link></li>
              <li><Link to="/faq" className="hover:text-brand-copper-light transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link to="/shipping" className="hover:text-brand-copper-light transition-colors">Envíos y Devoluciones</Link></li>
              <li><Link to="/contact" className="hover:text-brand-copper-light transition-colors">Contacto</Link></li>
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
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-2 pt-6 font-mono text-[10.5px] tracking-[0.08em] text-brand-muted">
          <p>&copy; {new Date().getFullYear()} OrigenAXM. Todos los derechos reservados.</p>
          <p>Pago seguro · Tarjeta, PSE o contra entrega</p>
        </div>
      </div>
    </footer>
  );
}
