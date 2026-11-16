import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Seo from './Seo';
import { SITE, whatsappLink } from '../config/site';

export interface LegalSection {
  title: string;
  body: ReactNode;
}

interface Props {
  title: string;
  description: string;
  path: string;
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
}

/** Estructura común de las páginas legales (términos, privacidad, garantía). */
export default function LegalLayout({ title, description, path, updated, intro, sections }: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <Seo title={title} description={description} path={path} />

      <header className="mb-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-muted">Información legal</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-black uppercase">{title}</h1>
        <div className="mt-4 h-1 w-16 bg-black rounded-full" />
        <p className="mt-5 text-gray-600 leading-relaxed">{intro}</p>
        <p className="mt-3 text-xs text-gray-400">Última actualización: {updated}</p>
      </header>

      <nav aria-label="Contenido" className="mb-12 border border-gray-100 bg-gray-50 px-5 py-4">
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-700">
          {sections.map((s, i) => (
            <li key={s.title}>
              <a href={`#sec-${i + 1}`} className="hover:underline">{s.title}</a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-10">
        {sections.map((s, i) => (
          <section key={s.title} id={`sec-${i + 1}`} className="scroll-mt-28">
            <h2 className="text-lg font-extrabold text-black uppercase tracking-tight">
              {i + 1}. {s.title}
            </h2>
            <div className="mt-3 space-y-3 text-sm text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-14 pt-6 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
        <Link to="/terms" className="hover:underline">Términos y condiciones</Link>
        <Link to="/privacy" className="hover:underline">Política de privacidad</Link>
        <Link to="/warranty" className="hover:underline">Garantía</Link>
        <Link to="/shipping" className="hover:underline">Envíos y devoluciones</Link>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:underline">
          WhatsApp {SITE.whatsapp.display}
        </a>
      </footer>
    </div>
  );
}
