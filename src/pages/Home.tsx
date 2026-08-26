import { Link } from 'react-router-dom';
import { API } from '../config/api';
import { useRef, useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import FloatingCartButton from '../components/layout/FloatingCartButton';
import ProductCard from '../components/ProductCard';

interface ApiBanner {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

interface ApiProduct {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  categoryId: string;
  images: string[];
  sellingPrice: number;
  discountPercentage: number;
  stock: number;
  isRecommended?: boolean;
  recommendedOrder?: number;
  isInternational?: boolean;
}

const TRUST = [
  { title: '100% originales', detail: 'Compra verificada al distribuidor' },
  { title: 'Envío 10 a 15 días', detail: 'Pedido internacional con seguimiento' },
  { title: 'Paga como quieras', detail: 'Tarjeta, PSE o contra entrega' },
];

export default function Home() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const recSliderRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState<ApiProduct[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const [featured, setFeatured] = useState<ApiProduct[]>([]);
  const [featLoading, setFeatLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const onImgError = (id: string) => setImgErrors(s => new Set(s).add(id));
  const catalogVersion = useCatalogStore((s) => s.version);
  const [banners, setBanners] = useState<ApiBanner[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);

  const loadProducts = () =>
    fetch(`${API}/api/products`)
      .then(r => r.ok ? r.json() : [])
      .then((data: ApiProduct[]) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));

  const loadRecommended = () =>
    fetch(`${API}/api/recommended`)
      .then(r => r.ok ? r.json() : [])
      .then((data: ApiProduct[]) => setRecommended(data))
      .catch(() => {})
      .finally(() => setRecLoading(false));

  const loadFeatured = () =>
    fetch(`${API}/api/featured`)
      .then(r => r.ok ? r.json() : [])
      .then((data: ApiProduct[]) => setFeatured(data))
      .catch(() => {})
      .finally(() => setFeatLoading(false));

  useEffect(() => {
    fetch(`${API}/api/banners`)
      .then(r => r.ok ? r.json() : [])
      .then((data: ApiBanner[]) => setBanners(data))
      .catch(() => {});
  }, []);

  // Rota automáticamente entre las imágenes del banner cuando hay más de una.
  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setBannerIndex(i => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    setLoading(true);
    setRecLoading(true);
    setFeatLoading(true);
    loadProducts();
    loadRecommended();
    loadFeatured();

    // El catálogo se cachea 10 min en el backend; no tiene sentido consultar más seguido que eso,
    // y solo mientras la pestaña está visible (evita pings de fondo indefinidos que mantienen la DB activa).
    const reloadAll = () => { loadProducts(); loadRecommended(); loadFeatured(); };
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') reloadAll();
    }, 600000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') reloadAll();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [catalogVersion]);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  const scrollRec = (direction: 'left' | 'right') => {
    if (recSliderRef.current) {
      recSliderRef.current.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  const arrowClass = 'w-10 h-10 flex items-center justify-center border border-brand-line text-brand-charcoal-light hover:border-brand-charcoal-dark hover:text-brand-charcoal-dark transition-colors';

  return (
    <div className="flex flex-col min-h-screen bg-brand-sand">

      {/* ── Hero partido: el titular vive sobre tinta, la foto al lado ── */}
      <section className="grid lg:grid-cols-[0.86fr_1.14fr] border-b border-brand-line">
        <div className="bg-brand-charcoal-dark text-brand-sand px-6 sm:px-10 lg:px-14 py-14 lg:py-20 flex flex-col justify-center gap-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-copper-light">
            Colección oficial
          </span>
          <h1 className="font-display font-extrabold text-[40px] sm:text-[52px] lg:text-[64px] leading-[0.96] tracking-[-0.035em]">
            Mantén el calor<br />en cada aventura.
          </h1>
          <p className="text-[16px] sm:text-[17px] leading-relaxed text-brand-sand-dark/75 max-w-md">
            Traemos los originales directo del catálogo oficial. Tú eliges el color, nosotros nos
            encargamos de la importación.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-1">
            <Link to="/catalog" className="btn-accent">
              Ver el catálogo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/shipping" className="text-[15px] font-semibold text-brand-sand border-b border-brand-sand/40 pb-0.5 hover:text-brand-copper-light hover:border-brand-copper-light transition-colors">
              Cómo funciona el pedido
            </Link>
          </div>
        </div>

        <div className="relative min-h-[280px] lg:min-h-[520px] bg-gray-100 overflow-hidden">
          {banners.length > 0 ? (
            banners.map((b, i) => (
              <img
                key={b.id}
                src={b.imageUrl}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === bannerIndex ? 'opacity-100' : 'opacity-0'}`}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            ))
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-brand-muted">
                Foto de estilo de vida
              </span>
            </div>
          )}

          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setBannerIndex(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  className={`h-1 transition-all ${i === bannerIndex ? 'w-7 bg-brand-sand' : 'w-3 bg-brand-sand/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Franja de confianza ── */}
      <section className="bg-gray-100 border-b border-brand-line">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-brand-line">
          {TRUST.map((t) => (
            <div key={t.title} className="px-5 sm:px-7 py-3 flex flex-col gap-0.5">
              <span className="font-display font-bold text-[13.5px] text-brand-charcoal-dark">{t.title}</span>
              <span className="text-[12px] text-brand-charcoal-light leading-snug">{t.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Productos recomendados ── */}
      {(recLoading || recommended.length > 0) && (
        <section className="py-14 lg:py-16 border-b border-brand-line">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-copper">Los más pedidos</span>
                <h2 className="font-display font-extrabold text-[28px] sm:text-[34px] tracking-[-0.03em] text-brand-charcoal-dark">
                  Productos recomendados
                </h2>
              </div>
              <div className="flex items-center gap-2.5">
                <Link to="/catalog" className="hidden sm:inline text-[14px] font-semibold text-brand-charcoal-dark border-b border-brand-line hover:border-brand-charcoal-dark pb-0.5 mr-2 transition-colors">
                  Ver todo el catálogo
                </Link>
                <button onClick={() => scrollRec('left')} aria-label="Anterior" className={arrowClass}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scrollRec('right')} aria-label="Siguiente" className={arrowClass}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {recLoading ? (
              <div className="flex gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-56 sm:w-64 animate-pulse">
                    <div className="aspect-[3/4] bg-brand-sand-dark mb-3.5" />
                    <div className="h-3 bg-brand-sand-dark w-3/4 mb-2" />
                    <div className="h-3 bg-brand-sand-dark w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div
                ref={recSliderRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
                style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
              >
                {recommended.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    badge="Top ventas"
                    priority={index === 0}
                    imgFailed={imgErrors.has(`rec-${product.id}`)}
                    onImgError={() => onImgError(`rec-${product.id}`)}
                    className="flex-shrink-0 w-56 sm:w-64 snap-start"
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Novedades destacadas ── */}
      <section className="py-14 lg:py-16 border-b border-brand-line overflow-hidden">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-copper">Recién llegados</span>
              <h2 className="font-display font-extrabold text-[28px] sm:text-[34px] tracking-[-0.03em] text-brand-charcoal-dark">
                Novedades destacadas
              </h2>
            </div>
            <div className="flex items-center gap-2.5">
              <button onClick={() => scroll('left')} aria-label="Anterior" className={arrowClass}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => scroll('right')} aria-label="Siguiente" className={arrowClass}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {featLoading ? (
            <div className="flex gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72 animate-pulse">
                  <div className="aspect-[3/4] bg-brand-sand-dark mb-3.5" />
                  <div className="h-3 bg-brand-sand-dark w-3/4 mb-2" />
                  <div className="h-3 bg-brand-sand-dark w-1/2" />
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-16 text-brand-muted">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No hay novedades destacadas aún.</p>
            </div>
          ) : (
            <div
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              {featured.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  badge="Recién llegado"
                  priority={index === 0}
                  imgFailed={imgErrors.has(`slider-${product.id}`)}
                  onImgError={() => onImgError(`slider-${product.id}`)}
                  className="flex-shrink-0 w-72 snap-start"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Grid del catálogo ── */}
      {!loading && products.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 mb-10">
              <h2 className="font-display font-extrabold text-[28px] sm:text-[34px] tracking-[-0.03em] text-brand-charcoal-dark">
                A los clientes les encanta
              </h2>
              <Link to="/catalog" className="hidden sm:flex items-center gap-2 text-[14px] font-semibold text-brand-charcoal-dark border-b border-brand-line hover:border-brand-charcoal-dark pb-0.5 transition-colors">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
              {products.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  imgFailed={imgErrors.has(`grid-${product.id}`)}
                  onImgError={() => onImgError(`grid-${product.id}`)}
                />
              ))}
            </div>

            <div className="mt-12 sm:hidden text-center">
              <Link to="/catalog" className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand-charcoal-dark border-b border-brand-line pb-0.5">
                Ver todos los productos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <FloatingCartButton />
    </div>
  );
}
