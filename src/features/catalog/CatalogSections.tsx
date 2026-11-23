import { useState } from 'react';
import ProductCard from '../../components/ProductCard';
import type { ProductCategorySection } from './grouping';

interface Props {
  sections: ProductCategorySection[];
  /** Prioriza la carga de la primera imagen (cuando la grilla queda arriba de la página) */
  priorityFirst?: boolean;
}

/** Muro del catálogo por categoría y tipo, como en "Todo el catálogo". Lo usan Catálogo e Inicio. */
export default function CatalogSections({ sections, priorityFirst = false }: Props) {
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const onImgError = (id: string) => setImgErrors(s => new Set(s).add(id));

  return (
    <div className="flex flex-col gap-16">
      {sections.map((section, sectionIndex) => (
        <section key={section.id || 'otros'} aria-labelledby={`cat-${section.id || 'otros'}`}>
          <div className="flex items-baseline justify-between gap-4 border-b border-brand-line pb-3 mb-7">
            <h2 id={`cat-${section.id || 'otros'}`} className="font-display font-extrabold text-[24px] sm:text-[28px] tracking-[-0.03em] text-brand-charcoal-dark">
              {section.name}
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-muted shrink-0">
              {section.total} producto{section.total !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-col gap-10">
            {section.types.map((group, groupIndex) => (
              <div key={group.id || 'otros'}>
                {section.types.length > 1 && (
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-charcoal-light mb-5">
                    {group.name} <span className="text-brand-muted">· {group.products.length}</span>
                  </h3>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
                  {group.products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={priorityFirst && sectionIndex === 0 && groupIndex === 0 && index === 0}
                      imgFailed={imgErrors.has(product.id)}
                      onImgError={() => onImgError(product.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
