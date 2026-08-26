import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export interface CardProduct {
  id: string;
  name: string;
  manufacturer?: string;
  images?: string[];
  sellingPrice: number;
  discountPercentage: number;
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
  const img = raw ? (raw.startsWith('http') ? raw : `http://localhost:5173${raw}`) : null;

  const finalPrice = product.discountPercentage > 0
    ? Math.round(product.sellingPrice * (1 - product.discountPercentage / 100))
    : product.sellingPrice;

  const soldOut = product.stock <= 0;

  return (
    <Link to={`/product/${product.id}`} className={`group flex flex-col ${className}`}>
      {/* Imagen: sin banda negra encima. Las etiquetas viven arriba, el envío abajo del precio. */}
      <div className={`relative aspect-[3/4] overflow-hidden mb-3.5 border border-brand-line flex items-center justify-center ${fit === 'contain' ? 'bg-brand-sand p-4' : 'bg-brand-sand-dark'}`}>
        {img && !imgFailed ? (
          <img
            src={img}
            alt={product.name}
            className={`w-full h-full transition-transform duration-700 group-hover:scale-[1.04] ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
            onError={onImgError}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
          />
        ) : (
          <Package className="w-14 h-14 text-brand-line" />
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

        {product.discountPercentage > 0 && (
          <span className="absolute top-3 right-3 bg-brand-copper-light text-brand-charcoal-dark font-mono text-[10px] font-semibold px-2 py-1">
            -{product.discountPercentage}%
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
            {product.discountPercentage > 0 && (
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
