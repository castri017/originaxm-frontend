import { useParams, Link, useNavigate } from 'react-router-dom';
import { API } from '../config/api';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Package, Loader2, ChevronDown, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

interface ApiProduct {
  id: string;
  productCode: string;
  name: string;
  description: string;
  detailedDescription?: string;
  components?: string;
  manufacturer?: string;
  measurements?: string;
  materials?: string;
  color?: string;
  shape?: string;
  design?: string;
  occasion?: string;
  capacity?: string;
  size?: string;
  categoryId: string;
  brandId?: string;
  typeId?: string;
  subTypeId?: string;
  images: string[];
  sellingPrice: number;
  discountPercentage: number;
  stock: number;
  isInternational?: boolean;
  variantGroupId?: string | null;
}

interface ApiCategory {
  id: string;
  name: string;
  brands: { id: string; name: string; types: { id: string; name: string; subTypes: { id: string; name: string }[] }[] }[];
}

const WA_NUMBER = '573216481430';

const WA_ICON = (
  <svg className="w-[18px] h-[18px] fill-current flex-shrink-0" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

function imgUrl(path: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `http://localhost:5173${path}`;
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-brand-line">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left group min-h-[48px]"
      >
        <span className="font-display font-semibold text-[15px] text-brand-charcoal-dark">{title}</span>
        <ChevronDown className={`w-4 h-4 text-brand-charcoal-light transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-6">{children}</div>}
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then(r => r.ok ? r.json() : [])
      .then(setCategories)
      .catch(() => {});
    fetch(`${API}/api/products`)
      .then(r => r.ok ? r.json() : [])
      .then(setAllProducts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id || loadedIdRef.current === id) return;
    loadedIdRef.current = id;
    setNotFound(false);
    setActiveImg(0);
    setQuantity(1);
    setAdded(false);

    // Si ya tenemos el producto en la lista cacheada (ej. al cambiar de color),
    // lo mostramos al instante sin spinner, y refrescamos en segundo plano.
    const cached = allProducts.find(p => p.id === id);
    if (cached) {
      setProduct(cached);
      setLoading(false);
      fetch(`${API}/api/products/${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(fresh => { if (fresh) setProduct(fresh); })
        .catch(() => {});
      return;
    }

    setLoading(true);
    fetch(`${API}/api/products/${id}`)
      .then(res => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.json();
      })
      .then(data => { if (data) setProduct(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, allProducts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-7 h-7 animate-spin text-brand-line" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Package className="w-14 h-14 mx-auto mb-5 text-brand-line" />
        <h2 className="font-display font-bold text-xl mb-4 text-brand-charcoal">Producto no encontrado</h2>
        <Link to="/catalog" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-copper hover:text-brand-copper-dark transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al catálogo
        </Link>
      </div>
    );
  }

  const images      = product.images?.length ? product.images : [];
  const outOfStock  = product.stock === 0;
  const disc        = product.discountPercentage ?? 0;
  const finalPrice  = disc > 0
    ? Math.round(product.sellingPrice * (1 - disc / 100))
    : product.sellingPrice;

  const handleAddToCart = () => {
    const cartProduct = {
      id: product.id,
      productCode: product.productCode,
      name: product.name,
      price: finalPrice,
      image: imgUrl(images[0] ?? ''),
      stock: product.stock,
      category: '',
      description: product.description,
    } as any;
    addItem(cartProduct, quantity, product.capacity || product.size || '');
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 2500);
  };

  const category = categories.find(c => c.id === product.categoryId);
  const brand    = category?.brands.find(b => b.id === product.brandId);
  const type     = brand?.types.find(t => t.id === product.typeId);
  const subType  = type?.subTypes.find(s => s.id === product.subTypeId);

  const colorVariants = product.variantGroupId
    ? allProducts.filter(p => p.variantGroupId === product.variantGroupId)
    : (product.color ? [product] : []);

  const specGrid = [
    { label: 'Frío / calor', value: product.measurements },
    { label: 'Capacidad',    value: product.capacity     },
    { label: 'Material',     value: product.materials    },
    { label: 'Libre de',     value: product.components   },
  ].filter(s => s.value);

  const allSpecs = [
    { label: 'Categoría',  value: category?.name },
    { label: 'Marca',      value: brand?.name    },
    { label: 'Tipo',       value: type?.name     },
    { label: 'SubTipo',    value: subType?.name  },
    { label: 'Fabricante', value: product.manufacturer },
    { label: 'Color',      value: product.color        },
    { label: 'Capacidad',  value: product.capacity     },
    { label: 'Tamaño',     value: product.size         },
    { label: 'Forma',      value: product.shape        },
    { label: 'Diseño',     value: product.design       },
    { label: 'Ocasión',    value: product.occasion     },
    { label: 'Medidas',    value: product.measurements },
    { label: 'Materiales', value: product.materials    },
  ].filter(s => s.value);

  return (
    <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-40 sm:pb-12">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-brand-muted mb-6">
        <Link to="/" className="hover:text-brand-charcoal-dark transition-colors">Inicio</Link>
        <span className="text-brand-line">/</span>
        <Link to="/catalog" className="hover:text-brand-charcoal-dark transition-colors">Catálogo</Link>
        <span className="text-brand-line">/</span>
        <span className="text-brand-charcoal-light truncate max-w-[45vw] sm:max-w-xs normal-case tracking-normal">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">

        {/* ── Galería ──────────────────────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-start gap-3">
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-2.5 flex-shrink-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  className={`w-[70px] h-[84px] flex-shrink-0 overflow-hidden bg-white border-2 transition-colors ${
                    activeImg === i ? 'border-brand-charcoal-dark' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl(img)} alt="" className="w-full h-full object-contain p-1.5" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}

          <div className="relative flex-1 bg-white overflow-hidden w-full aspect-[4/5] sm:aspect-[5/6]">
            {images.length > 0 ? (
              <img
                src={imgUrl(images[activeImg])}
                alt={product.name}
                className="w-full h-full object-contain p-8"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-20 h-20 text-brand-line" />
              </div>
            )}

            {outOfStock ? (
              <span className="absolute top-4 left-4 bg-brand-charcoal-light text-brand-sand font-mono text-[10px] uppercase tracking-[0.14em] px-3 py-1.5">
                Agotado
              </span>
            ) : (
              <span className="absolute top-4 left-4 bg-brand-charcoal-dark text-brand-sand font-mono text-[10px] uppercase tracking-[0.14em] px-3 py-1.5">
                {product.stock <= 5 ? 'Últimas unidades' : 'Nuevo'}
              </span>
            )}
            {disc > 0 && (
              <span className="absolute top-4 right-4 bg-brand-copper-light text-brand-charcoal-dark font-mono text-[10px] font-semibold px-2.5 py-1.5">
                -{disc}%
              </span>
            )}
          </div>
        </div>

        {/* ── Información ─────────────────────────────── */}
        <div className="flex flex-col gap-6">

          <div className="flex flex-col gap-3">
            {product.manufacturer && (
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-muted">
                {product.manufacturer}
              </span>
            )}
            <h1 className="font-display font-extrabold text-[30px] sm:text-[38px] leading-[1.08] tracking-[-0.03em] text-brand-charcoal-dark">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mt-1">
              {product.sellingPrice > 0 && (
                <span className="font-display font-extrabold text-[30px] text-brand-charcoal-dark leading-none">
                  ${finalPrice.toLocaleString('es-CL')}
                </span>
              )}
              {disc > 0 && (
                <span className="text-[15px] text-brand-muted line-through">
                  ${product.sellingPrice.toLocaleString('es-CL')}
                </span>
              )}
              {outOfStock ? (
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-brand-charcoal-light border border-brand-line px-2.5 py-1">
                  Agotado
                </span>
              ) : product.stock <= 5 ? (
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-brand-copper-dark bg-brand-sand-dark px-2.5 py-1">
                  Solo {product.stock} disponibles
                </span>
              ) : null}
            </div>

            <p className="text-[13.5px] text-brand-charcoal-light">
              Precios con IVA incluido. Envío calculado al finalizar compra.
            </p>
          </div>

          {/* Color */}
          {product.color && (
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-charcoal-light">
                Color · <span className="text-brand-charcoal-dark">{product.color}</span>
              </span>
              <div className="flex flex-wrap gap-2.5">
                {colorVariants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => v.id !== product.id && navigate(`/product/${v.id}`)}
                    title={v.color || v.name}
                    className={`w-[52px] h-[52px] overflow-hidden bg-white border-2 flex-shrink-0 transition-colors ${
                      v.id === product.id
                        ? 'border-brand-charcoal-dark'
                        : 'border-brand-line opacity-70 hover:opacity-100 hover:border-brand-charcoal-light'
                    }`}
                  >
                    {v.images?.[0] ? (
                      <img src={imgUrl(v.images[0])} alt={v.color || v.name} className="w-full h-full object-contain p-1" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-brand-line" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Especificaciones rápidas */}
          {specGrid.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-[1px] bg-white border border-brand-line">
              {specGrid.map(({ label, value }) => (
                <div key={label} className="bg-brand-sand px-4 py-3.5 flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-brand-muted">{label}</span>
                  <span className="font-display font-bold text-[15px] text-brand-charcoal-dark leading-snug">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Compra */}
          <div className="flex flex-col gap-3">
            {outOfStock ? (
              <>
                <button disabled className="w-full bg-brand-sand-dark text-brand-muted font-display font-bold text-[15px] py-4 min-h-[52px] flex items-center justify-center gap-2.5 cursor-not-allowed">
                  <ShoppingCart className="w-4 h-4" />
                  Producto agotado
                </button>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`¡Hola! Quisiera realizar un pedido del producto: ${product.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost w-full"
                >
                  {WA_ICON} Pedir por WhatsApp
                </a>
              </>
            ) : (
              <>
                <div className="flex items-stretch gap-3">
                  <div className="flex items-center border border-brand-line flex-shrink-0">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Quitar uno"
                      className="w-11 h-[52px] flex items-center justify-center text-brand-charcoal-light hover:bg-brand-sand-dark transition-colors disabled:opacity-25 text-lg"
                    >−</button>
                    <span className="w-10 text-center font-display font-bold text-[16px]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      aria-label="Añadir uno"
                      className="w-11 h-[52px] flex items-center justify-center text-brand-charcoal-dark hover:bg-brand-sand-dark transition-colors disabled:opacity-25 text-lg"
                    >+</button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 font-display font-bold text-[15px] min-h-[52px] flex items-center justify-center gap-2.5 transition-colors ${
                      added ? 'bg-brand-stock text-brand-sand' : 'bg-brand-charcoal-dark text-brand-sand hover:bg-brand-charcoal'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {added ? 'Añadido al carrito' : `Añadir al carrito · $${finalPrice.toLocaleString('es-CL')}`}
                  </button>
                </div>
                {added && (
                  <Link to="/cart" className="btn-ghost w-full">
                    Ver carrito
                  </Link>
                )}
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`¡Hola! Tengo una duda sobre: ${product.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-brand-copper hover:text-brand-copper-dark transition-colors self-start"
                >
                  Preguntar por WhatsApp
                </a>
              </>
            )}
          </div>

          {/* Pedido internacional: se explica en 3 pasos en vez de una banda sobre la foto */}
          {product.isInternational && (
            <div className="bg-white border border-brand-line p-5 flex flex-col gap-4">
              <span className="font-display font-bold text-[15px] text-brand-charcoal-dark">
                Este producto viene por pedido internacional
              </span>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted">1 · Confirmas</span>
                  <span className="text-[13px] text-brand-charcoal-light leading-snug">Pagas y reservamos tu unidad.</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted">2 · Importamos</span>
                  <span className="text-[13px] text-brand-charcoal-light leading-snug">Lo traemos del catálogo oficial.</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted">3 · Llega</span>
                  <span className="text-[13px] text-brand-charcoal-light leading-snug">10 a 15 días, con seguimiento.</span>
                </div>
              </div>
            </div>
          )}

          {/* Acordeones */}
          <div className="flex flex-col">
            <Accordion title="Especificaciones técnicas">
              <div className="flex flex-col">
                {allSpecs.map(s => (
                  <div key={s.label} className="flex items-start gap-6 py-2.5 border-b border-brand-line last:border-b-0">
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted w-28 flex-shrink-0 pt-0.5">{s.label}</span>
                    <span className="text-[13.5px] text-brand-charcoal">{s.value}</span>
                  </div>
                ))}
              </div>
            </Accordion>

            {product.detailedDescription && product.detailedDescription !== product.description && (
              <Accordion title="Descripción detallada">
                <p className="text-[14px] text-brand-charcoal-light leading-relaxed">{product.detailedDescription}</p>
              </Accordion>
            )}

            {product.components && specGrid.every(s => s.label !== 'Libre de') && (
              <Accordion title="¿Qué incluye?">
                <p className="text-[14px] text-brand-charcoal-light leading-relaxed">{product.components}</p>
              </Accordion>
            )}

            <div className="border-t border-brand-line" />
          </div>

          <Link
            to="/catalog"
            className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-brand-muted hover:text-brand-charcoal-dark transition-colors self-start"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al catálogo
          </Link>
        </div>
      </div>

      {/* Descripción a ancho completo */}
      {product.description && (
        <div className="mt-16 pt-10 border-t border-brand-line">
          <h2 className="font-display font-extrabold text-[24px] tracking-[-0.02em] text-brand-charcoal-dark mb-4">
            Sobre este producto
          </h2>
          <p className="text-[15px] text-brand-charcoal-light leading-relaxed max-w-2xl">{product.description}</p>
        </div>
      )}

      {/* Barra de compra fija en móvil */}
      <div
        className="sm:hidden fixed bottom-16 left-0 right-0 z-30 bg-brand-sand border-t border-brand-line px-4 py-3 flex items-center gap-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        {product.sellingPrice > 0 && (
          <div className="flex flex-col min-w-0">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-brand-muted">Precio</span>
            <span className="font-display font-extrabold text-[17px] text-brand-charcoal-dark leading-tight">
              ${finalPrice.toLocaleString('es-CL')}
            </span>
            {disc > 0 && (
              <span className="text-[10px] text-brand-muted line-through">${product.sellingPrice.toLocaleString('es-CL')}</span>
            )}
          </div>
        )}
        {outOfStock ? (
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`¡Hola! Quisiera realizar un pedido del producto: ${product.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[48px] border border-brand-charcoal-dark text-brand-charcoal-dark font-display font-bold text-[14px] flex items-center justify-center gap-2"
          >
            {WA_ICON} Pedir por WhatsApp
          </a>
        ) : (
          <button
            onClick={handleAddToCart}
            className={`flex-1 min-h-[48px] font-display font-bold text-[14px] transition-colors ${
              added ? 'bg-brand-stock text-brand-sand' : 'bg-brand-charcoal-dark text-brand-sand'
            }`}
          >
            {added ? 'Añadido' : 'Añadir al carrito'}
          </button>
        )}
      </div>
    </div>
  );
}
