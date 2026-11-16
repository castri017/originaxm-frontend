import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchProduct } from '../features/catalog/queries';
import { imageUrl } from '../lib/imageUrl';
import { getEffectiveDiscount, getFinalPrice } from '../features/promotions/pricing';

export interface CardProduct {
  id: string;
  name: string;
  manufacturer?: string;
  images?: string[];
  sellingPrice: number;
  discountPercentage: number;
  /** Descuento final calculado por la API (incluye promociones vigentes). */
  effectiveDiscountPercentage?: number;
  stock: number;
  isInternational?: boolean;
}

interface Props {
  product: CardProduct;
  /** Etiqueta de esquina: "Top ventas", "Recién llegado"… */
  badge?: string;
  /** Cargar la imagen con prioridad (solo la primera de la fila) */
  priority?: boolean;
  /** Ajuste de la imagen: contain para fondo blanco, cover para foto de ambiente */
  fit?: 'contain' | 'cover';
  /** Se llama cuando la imagen falla, para dibujar el placeholder */
  onImgError?: () => void;
  imgFailed?: boolean;
  className?: string;
}

const WHATSAPP = '573216481430';

export default function ProductCard({
  product, badge, priority, fit = 'contain', onImgError, imgFailed, className = '',
}: Props) {
  const raw = product.images?.[0];
  const img = raw ? imageUrl(raw) : null;
  // Segunda foto: se funde sobre la primera al pasar el cursor.
  const rawAlt = product.images?.[1];
  const altImg = rawAlt ? imageUrl(rawAlt) : null;
  // Solo la tarjeta que se tocó comparte su foto con la ficha en la transición de página
  // (el mismo producto puede estar en varias filas de Inicio).
  const [opening, setOpening] = useState(false);
  const queryClient = useQueryClient();
  // Precarga la ficha con la intención de abrirla (hover, foco o toque), antes del clic.
  const prefetch = () => prefetchProduct(queryClient, product.id);

  const discount   = getEffectiveDiscount(product);
  const finalPrice = getFinalPrice(product);

  const soldOut = product.stock <= 0;

  return (
    <Link
      to={`/product/${product.id}`}
      viewTransition
      onClick={() => setOpening(true)}
      className={`group flex flex-col ${className}`}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
    >
      {/* Imagen: sin banda negra encima. Las etiquetas viven arriba, el envío abajo del precio. */}
      <div className={`relative aspect-[3/4] overflow-hidden mb-3.5 border border-brand-line flex items-center justify-center transition-[translate,box-shadow,border-color] duration-300 group-hover:-translate-y-1 group-hover:border-brand-charcoal-light group-hover:shadow-[0_14px_30px_rgba(28,26,22,0.10)] ${fit === 'contain' ? 'bg-brand-sand p-4' : 'bg-brand-sand-dark'}`}>
        {img && !imgFailed ? (
          <img
            src={img}
            alt={product.name}
            style={opening ? { viewTransitionName: 'product-image' } : undefined}
            className={`w-full h-full transition-[transform,opacity] duration-700 group-hover:scale-[1.04] ${altImg ? 'group-hover:opacity-0' : ''} ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
            onError={onImgError}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
          />
        ) : (
          <Package className="w-14 h-14 text-brand-line" />
        )}

        {img && !imgFailed && altImg && (
          <img
            src={altImg}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full opacity-0 scale-[1.04] transition-opacity duration-700 group-hover:opacity-100 ${fit === 'contain' ? 'object-contain p-4' : 'object-cover'}`}
            loading="lazy"
            decoding="async"
          />
        )}

        {!soldOut && (
          <span className="hidden sm:flex absolute inset-x-0 bottom-0 items-center justify-center gap-2 bg-brand-charcoal-dark text-brand-sand font-display font-bold text-[13px] py-3 translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0 transition-[translate] duration-300">
            Ver producto <ArrowRight className="w-3.5 h-3.5" />
          </span>
        )}

        {soldOut ? (
          <span className="absolute top-3 left-3 bg-brand-charcoal-light text-brand-sand font-mono text-[10px] uppercase tracking-[0.12em] px-2.5 py-1.5">
            Agotado
          </span>
        ) : badge ? (
          <span className="absolute top-3 left-3 bg-brand-charcoal-dark text-brand-sand font-mono text-[10px] uppercase tracking-[0.12em] px-2.5 py-1.5">
            {badge}
          </span>
        ) : null}

        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-brand-copper-light text-brand-charcoal-dark font-mono text-[10px] font-semibold px-2 py-1">
            -{discount}%
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {product.manufacturer && (
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand-muted">{product.manufacturer}</span>
        )}
        <h3 className="font-display font-semibold text-[15px] leading-snug text-brand-charcoal-dark line-clamp-2 group-hover:text-brand-copper transition-colors">
          {product.name}
        </h3>

        {product.sellingPrice > 0 && (
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-display font-bold text-[19px] text-brand-charcoal-dark">
              ${finalPrice.toLocaleString('es-CL')}
            </span>
            {discount > 0 && (
              <span className="text-[13px] text-brand-muted line-through">
                ${product.sellingPrice.toLocaleString('es-CL')}
              </span>
            )}
          </div>
        )}

        {/* Sello de envío discreto */}
        <span className={product.isInternational ? 'ship-note' : 'ship-note-stock'}>
          {product.isInternational ? '· pedido internacional · 10-15 días' : '· entrega inmediata · 2-4 días'}
        </span>

        {soldOut && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`¡Hola! Quisiera realizar un pedido del producto: ${product.name}`)}`, '_blank');
            }}
            className="mt-2 w-full min-h-[44px] border border-brand-charcoal-dark text-brand-charcoal-dark font-display font-bold text-[13.5px] hover:bg-brand-sand-dark transition-colors"
          >
            Pedir por WhatsApp
          </button>
        )}
      </div>
    </Link>
  );
}
