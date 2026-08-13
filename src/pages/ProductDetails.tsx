import { useParams, Link, useNavigate } from 'react-router-dom';
import { API } from '../config/api';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Package, Loader2, ChevronDown, Clock, Droplets, Layers, ShieldCheck, ShoppingCart } from 'lucide-react';
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

// Los distintos colores de un mismo producto no están vinculados en la base de
// datos; se agrupan por nombre base (el nombre sin el color al final) + categoría/tipo.
function baseProductName(p: ApiProduct) {
  const name = p.name.trim();
  const color = (p.color ?? '').trim();
  if (color && name.toLowerCase().endsWith(color.toLowerCase())) {
    return name.slice(0, name.length - color.length).trim().toLowerCase();
  }
  return name.toLowerCase();
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 text-left group"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-700 group-hover:text-black transition-colors">{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-5">{children}</div>}
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
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    setActiveImg(0);
    setQuantity(1);
    setAdded(false);
    fetch(`${API}/api/products/${id}`)
      .then(res => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.json();
      })
      .then(data => { if (data) setProduct(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-7 h-7 animate-spin text-gray-300" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Package className="w-14 h-14 mx-auto mb-5 text-gray-200" />
        <h2 className="text-xl font-bold mb-4 text-gray-700">Producto no encontrado</h2>
        <Link to="/catalog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black hover:opacity-60 transition-opacity">
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

  const colorVariants = allProducts.filter(p =>
    p.categoryId === product.categoryId &&
    (p.typeId ?? '') === (product.typeId ?? '') &&
    (p.subTypeId ?? '') === (product.subTypeId ?? '') &&
    baseProductName(p) === baseProductName(product)
  );

  const specGrid = [
    { Icon: Clock,       label: 'Frío / Calor', value: product.measurements },
    { Icon: Droplets,    label: 'Capacidad',    value: product.capacity     },
    { Icon: Layers,      label: 'Material',     value: product.materials    },
    { Icon: ShieldCheck, label: 'Libre de',     value: product.components   },
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
    <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-36 sm:pb-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] text-gray-400 mb-5 tracking-wide">
        <Link to="/" className="hover:text-black transition-colors">Inicio</Link>
        <span className="text-gray-200">/</span>
        <Link to="/catalog" className="hover:text-black transition-colors">Catálogo</Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-600 truncate max-w-[40vw] sm:max-w-xs">{product.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

        {/* ── Gallery ───────────────────────────────────── */}
        <div className="w-full md:w-[38%] md:max-w-sm flex flex-col-reverse sm:flex-row gap-3">

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-2 flex-shrink-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-14 h-14 flex-shrink-0 overflow-hidden bg-[#f4f4f4] border transition-all duration-200 ${
                    activeImg === i ? 'border-gray-800' : 'border-gray-200 opacity-55 hover:opacity-90'
                  }`}
                >
                  <img src={imgUrl(img)} alt="" className="w-full h-full object-contain p-1" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="relative bg-[#f4f4f4] overflow-hidden w-full sm:max-w-[240px]" style={{ aspectRatio: '4/5' }}>
            {images.length > 0 ? (
              <img
                src={imgUrl(images[activeImg])}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-20 h-20 text-gray-300" />
              </div>
            )}

            {/* Top-left badge */}
            {outOfStock ? (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1">
                Sin Stock
              </span>
            ) : (
              <span className="absolute top-4 left-4 bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1">
                {product.stock <= 5 ? 'Últimas unidades' : 'Nuevo'}
              </span>
            )}
            {disc > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1">
                -{disc}%
              </span>
            )}
            {product.isInternational && (
              <span className="absolute bottom-0 left-0 right-0 bg-black/85 text-white text-[10px] font-bold uppercase tracking-[0.15em] text-center py-2 px-2">
                Pedido internacional · Envío 10-15 días
              </span>
            )}
          </div>
        </div>

        {/* ── Product info ──────────────────────────────── */}
        <div className="w-full md:flex-1 flex flex-col">

          {/* Manufacturer */}
          {product.manufacturer && (
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-1.5">
              {product.manufacturer}
            </p>
          )}

          {/* Name */}
          <h1 className="text-[1.35rem] sm:text-[1.5rem] font-extrabold text-black leading-snug mb-2.5">
            {product.name}
          </h1>

          {/* Price row */}
          <div className="flex items-center gap-3 mb-1">
            {product.sellingPrice > 0 && (
              <p className="text-[1.6rem] font-black text-black leading-none">
                ${finalPrice.toLocaleString('es-CL')}
              </p>
            )}
            {outOfStock ? (
              <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-red-500 px-3 py-1 rounded-full">
                Sin Stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                ¡Solo {product.stock} restantes!
              </span>
            ) : null}
            {disc > 0 && (
              <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                -{disc}% OFF
              </span>
            )}
          </div>

          {disc > 0 && (
            <p className="text-xs text-gray-400 line-through mb-1.5">
              ${product.sellingPrice.toLocaleString('es-CL')}
            </p>
          )}

          <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
            Precios con IVA incluido. Envío calculado al finalizar compra.
          </p>

          {/* Color swatch */}
          {product.color && (
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black mb-2">
                Color: <span className="font-normal normal-case tracking-normal text-gray-500">{product.color}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colorVariants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => v.id !== product.id && navigate(`/product/${v.id}`)}
                    title={v.color || v.name}
                    className={`w-12 h-12 rounded-lg overflow-hidden bg-[#f4f4f4] border-2 flex-shrink-0 transition-all ${
                      v.id === product.id
                        ? 'border-black ring-2 ring-offset-2 ring-gray-700'
                        : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-400'
                    }`}
                  >
                    {v.images?.[0] ? (
                      <img src={imgUrl(v.images[0])} alt={v.color || v.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spec grid */}
          {specGrid.length > 0 && (
            <div className="grid grid-cols-2 gap-[1px] bg-gray-200 border border-gray-200 mb-5">
              {specGrid.map(({ Icon, label, value }) => (
                <div key={label} className="bg-white flex items-center gap-3 px-3 py-2.5">
                  <Icon className="w-[15px] h-[15px] text-gray-400 flex-shrink-0 stroke-[1.5]" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 leading-none mb-[3px]">{label}</p>
                    <p className="text-[12px] font-semibold text-black leading-tight">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity selector */}
          {!outOfStock && (
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Cantidad</span>
              <div className="flex items-center border border-gray-200">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-25 text-base"
                >−</button>
                <span className="w-9 h-8 flex items-center justify-center text-sm font-bold border-x border-gray-200">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-25 text-base"
                >+</button>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex flex-col gap-2 mb-5">
            {outOfStock ? (
              <>
                <button
                  disabled
                  className="w-full bg-[#2d3748] text-white text-[11px] font-bold uppercase tracking-[0.22em] py-3.5 flex items-center justify-center gap-2.5 cursor-not-allowed opacity-90"
                >
                  <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                  Producto Agotado
                </button>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`¡Hola! Quisiera realizar un pedido del producto: ${product.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bc5a] text-white text-[11px] font-bold uppercase tracking-[0.22em] py-3.5 flex items-center justify-center gap-2.5 transition-colors"
                >
                  {WA_ICON} Pedir por WhatsApp
                </a>
              </>
            ) : (
              <>
                <button
                  onClick={handleAddToCart}
                  className={`w-full text-[11px] font-bold uppercase tracking-[0.22em] py-3.5 flex items-center justify-center gap-2.5 transition-all ${
                    added ? 'bg-green-600 text-white' : 'bg-black hover:bg-gray-900 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                  {added ? '✓  Añadido al carrito' : 'Añadir al Carrito'}
                </button>
                {added && (
                  <Link
                    to="/cart"
                    className="w-full border border-black text-black text-[11px] font-bold uppercase tracking-[0.22em] py-3 flex items-center justify-center transition-all hover:bg-black hover:text-white"
                  >
                    Ver carrito →
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Accordions */}
          <Accordion title="Especificaciones Técnicas">
            <div className="divide-y divide-gray-50">
              {allSpecs.map(s => (
                <div key={s.label} className="flex items-start py-2.5 gap-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 w-24 flex-shrink-0 pt-0.5">{s.label}</span>
                  <span className="text-[13px] text-gray-700">{s.value}</span>
                </div>
              ))}
            </div>
          </Accordion>

          {product.detailedDescription && product.detailedDescription !== product.description && (
            <Accordion title="Descripción Detallada">
              <p className="text-[13px] text-gray-600 leading-relaxed">{product.detailedDescription}</p>
            </Accordion>
          )}

          {product.components && specGrid.every(s => s.label !== 'Libre de') && (
            <Accordion title="¿Qué incluye?">
              <p className="text-[13px] text-gray-600 leading-relaxed">{product.components}</p>
            </Accordion>
          )}

          <Link
            to="/catalog"
            className="mt-5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 hover:text-black transition-colors self-start"
          >
            <ArrowLeft className="w-3 h-3" /> Volver al catálogo
          </Link>
        </div>
      </div>

      {/* Full-width description */}
      {product.description && (
        <div className="mt-16 pt-10 border-t border-gray-100">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-black mb-4">
            Descripción del Producto
          </h2>
          <p className="text-[13px] text-gray-500 leading-loose max-w-2xl">{product.description}</p>
        </div>
      )}

      {/* Mobile sticky CTA */}
      <div
        className="sm:hidden fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        {product.sellingPrice > 0 && (
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold leading-none mb-0.5">Precio</span>
            <span className="text-base font-black text-black leading-tight">${finalPrice.toLocaleString('es-CL')}</span>
            {disc > 0 && (
              <span className="text-[9px] text-gray-400 line-through">${product.sellingPrice.toLocaleString('es-CL')}</span>
            )}
          </div>
        )}
        {outOfStock ? (
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`¡Hola! Quisiera realizar un pedido del producto: ${product.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#25D366] text-white text-[10px] font-bold uppercase tracking-wider py-3 flex items-center justify-center gap-2"
          >
            {WA_ICON} Pedir por WhatsApp
          </a>
        ) : (
          <button
            onClick={handleAddToCart}
            className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-3 transition-all ${
              added ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-gray-900'
            }`}
          >
            {added ? '✓ Añadido' : 'Añadir al Carrito'}
          </button>
        )}
      </div>
    </div>
  );
}
