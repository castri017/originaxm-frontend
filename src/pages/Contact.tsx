import { MessageCircle, Instagram, Music, Facebook } from 'lucide-react';
import { SITE, whatsappLink } from '../config/site';
import Seo from '../components/Seo';

export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <Seo title="Contacto" description="Escríbenos por WhatsApp, Instagram, TikTok o Facebook. Te ayudamos a elegir tu termo Stanley y a hacer tu pedido." path="/contact" />
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-extrabold tracking-tight text-black uppercase">
          Contáctanos
        </h1>
        <div className="mt-4 h-1 w-16 bg-black mx-auto rounded-full" />
        <p className="mt-5 text-gray-600 text-base leading-relaxed">
          ¿Tienes dudas o quieres hacer tu pedido? Estamos listos para ayudarte y asesorarte en la compra de tu producto.
        </p>
      </div>

      {/* Channels */}
      <div className="space-y-4">

        {/* WhatsApp */}
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-5 bg-[#25D366] hover:bg-[#1ebe5d] transition-colors rounded-sm px-6 py-5 group"
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-white text-sm uppercase tracking-widest">WhatsApp</p>
            <p className="text-white/90 text-base font-semibold mt-0.5">{SITE.whatsapp.display}</p>
            <p className="text-white/70 text-xs mt-0.5">Te respondemos en minutos</p>
          </div>
          <span className="text-white/60 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
            Escribir →
          </span>
        </a>

        {/* Instagram */}
        <a
          href={SITE.social.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-5 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 transition-opacity rounded-sm px-6 py-5 group"
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <Instagram className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-white text-sm uppercase tracking-widest">Instagram</p>
            <p className="text-white/90 text-base font-semibold mt-0.5">@originaxm</p>
            <p className="text-white/70 text-xs mt-0.5">Novedades, productos y contenido</p>
          </div>
          <span className="text-white/60 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
            Ver perfil →
          </span>
        </a>

        {/* TikTok */}
        <a
          href={SITE.social.tiktok.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-5 bg-black hover:bg-gray-900 transition-colors rounded-sm px-6 py-5 group"
        >
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-white text-sm uppercase tracking-widest">TikTok</p>
            <p className="text-white/90 text-base font-semibold mt-0.5">@originaxm</p>
            <p className="text-white/70 text-xs mt-0.5">Reviews, tendencias y contenido</p>
          </div>
          <span className="text-white/60 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
            Ver perfil →
          </span>
        </a>

        {/* Facebook */}
        <a
          href={SITE.social.facebook.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-5 bg-[#1877F2] hover:bg-[#166ad8] transition-colors rounded-sm px-6 py-5 group"
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <Facebook className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-white text-sm uppercase tracking-widest">Facebook</p>
            <p className="text-white/90 text-base font-semibold mt-0.5">{SITE.social.facebook.handle}</p>
            <p className="text-white/70 text-xs mt-0.5">Comunidad, novedades y promociones</p>
          </div>
          <span className="text-white/60 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
            Ver página →
          </span>
        </a>

      </div>

      {/* Trust badge */}
      <div className="mt-12 flex items-center justify-center gap-3 bg-gray-50 border border-gray-100 rounded-sm px-6 py-4">
        <span className="text-2xl">🔒</span>
        <p className="text-sm font-bold text-black">Garantizamos productos 100% originales</p>
      </div>
    </div>
  );
}
