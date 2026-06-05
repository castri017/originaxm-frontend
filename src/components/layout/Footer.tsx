import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-charcoal-dark text-brand-sand pt-6 pb-4 border-t-4 border-brand-copper" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold text-base tracking-wider text-brand-copper-light mb-2">OrigenAXM</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Transformando tu estilo con la fuerza del águila. Ropa, accesorios y el espíritu de Alexander & Maria.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-brand-copper mb-2">Tienda</h4>
            <ul className="space-y-1 text-xs text-gray-400">
              <li><Link to="/catalog" className="hover:text-white transition-colors">Todos los productos</Link></li>
              <li><Link to="/catalog?category=novedades" className="hover:text-white transition-colors">Novedades</Link></li>
              <li><Link to="/catalog?category=ofertas" className="hover:text-white transition-colors">Ofertas Especiales</Link></li>
              <li><Link to="/catalog?category=accesorios" className="hover:text-white transition-colors">Accesorios</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-brand-copper mb-2">Ayuda</h4>
            <ul className="space-y-1 text-xs text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">Envíos y Devoluciones</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-brand-copper mb-2">Síguenos</h4>
            <div className="flex space-x-3">
              <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer" className="p-1.5 bg-brand-charcoal rounded-full hover:bg-[#25D366] transition-colors group">
                <MessageCircle className="w-4 h-4 text-white group-hover:text-white" />
              </a>
              <a href="https://www.instagram.com/originaxm/" target="_blank" rel="noopener noreferrer" className="p-1.5 bg-brand-charcoal rounded-full hover:bg-[#E1306C] transition-colors group">
                <Instagram className="w-4 h-4 text-white group-hover:text-white" />
              </a>
            </div>
          </div>

        </div>
        <div className="mt-5 pt-4 border-t border-gray-700 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} OrigenAXM. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
