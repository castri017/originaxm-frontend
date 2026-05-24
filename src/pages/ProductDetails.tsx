import { useParams, Link } from 'react-router-dom';
import { API } from '../config/api';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Truck, ShieldCheck, Package, Loader2, ChevronDown, Clock } from 'lucide-react';
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
}

interface ApiCategory {
  id: string;
  name: string;
  brands: { id: string; name: string; types: { id: string; name: string; subTypes: { id: string; name: string }[] }[] }[];
}

const WA_NUMBER = '573216481430';
const WA_ICON = (
  <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24">
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
    <div className="border-t border-gray-100">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-gray-700">{title}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore(state => state.addItem);

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
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
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
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
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-200" />
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Producto no encontrado</h2>
        <Link to="/catalog" className="inline-flex items-center gap-2 text-sm font-bold text-black hover:underline">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const outOfStock = product.stock === 0;
  const disc = product.discountPercentage ?? 0;
  const finalPrice = disc > 0
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

  const category  = categories.find(c => c.id === product.categoryId);
  const brand     = category?.brands.find(b => b.id === product.brandId);
  const type      = brand?.types.find(t => t.id === product.typeId);
  const subType   = type?.subTypes.find(s => s.id === product.subTypeId);

  const quickSpecs = [
    { label: 'Color',     value: product.color },
    { label: 'Capacidad', value: product.capacity },
    { label: 'Tamaño',    value: product.size },
    { label: 'Ocasión',   value: product.occasion },
  ].filter(d => d.value);

  const allSpecs = [
    { label: 'Categoría',  value: category?.name },
    { label: 'Marca',      value: brand?.name },
    { label: 'Tipo',       value: type?.name },
    { label: 'SubTipo',    value: subType?.name },
    { label: 'Fabricante', value: product.manufacturer },
    { label: 'Color',      value: product.color },
    { label: 'Capacidad',  value: product.capacity },
    { label: 'Tamaño',     value: product.size },
    { label: 'Forma',      value: product.shape },
    { label: 'Diseño',     value: product.design },
    { label: 'Ocasión',    value: product.occasion },
    { label: 'Medidas',    value: product.measurements },
    { label: 'Materiales', value: product.materials },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-black transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-black transition-colors">Catálogo</Link>
        <span>/</span>
        <span className="text-black font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-10 lg:gap-16">

        {/* ── Gallery ─────────────────────────────────── */}
        <div className="w-full md:w-1/2 flex gap-3">
          {images.length > 1 && (
            <div className="flex flex-col gap-2 w-16 flex-shrink-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-20 border rounded-sm overflow-hidden bg-gray-50 flex items-center justify-center transition-all ${
                    activeImg === i ? 'border-black' : 'border-gray-100 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl(img)} alt="" className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}

          <div className="relative flex-1 aspect-[3/4] border border-gray-100 rounded-sm overflow-hidden bg-gray-50 flex items-center justify-center sticky top-24">
            {images.length > 0 ? (
              <img
                src={imgUrl(images[activeImg])}
                alt={product.name}
                className="w-full h-full object-contain p-6"
              />
            ) : (
              <Package className="w-24 h-24 text-gray-200" />
            )}
            {product.discountPercentage > 0 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow">
                -{product.discountPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* ── Info ────────────────────────────────────── */}
        <div className="w-full md:w-1/2 flex flex-col">

          {/* Brand + code */}
          <div className="flex items-center gap-3 mb-2">
            {product.manufacturer && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{product.manufacturer}</p>
            )}
            {product.productCode && (
              <span className="font-mono text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-sm tracking-widest">
                #{product.productCode}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-black mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Price + stock */}
          <div className="flex items-center gap-4 mb-5">
            {product.sellingPrice > 0 && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-black">
                    ${finalPrice.toLocaleString('es-CL')}
                  </p>
                  {product.discountPercentage > 0 && (
                    <span className="bg-red-500 text-white text-sm font-extrabold px-3 py-1 rounded-full shadow-sm">
                      -{product.discountPercentage}% OFF
                    </span>
                  )}
                </div>
                {product.discountPercentage > 0 && (
                  <p className="text-sm text-gray-400 line-through">
                    Antes: ${product.sellingPrice.toLocaleString('es-CL')}
                  </p>
                )}
              </div>
            )}
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              outOfStock
                ? 'bg-red-100 text-red-600'
                : product.stock <= 5
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-green-100 text-green-700'
            }`}>
              {outOfStock ? 'Sin stock' : product.stock <= 5 ? `¡Solo ${product.stock} restantes!` : `${product.stock} en stock`}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 text-base leading-relaxed mb-5">
              {product.description}
            </p>
          )}

          {/* Quick specs chips */}
          {quickSpecs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {quickSpecs.map(s => (
                <span key={s.label} className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                  <span className="text-gray-400 font-normal">{s.label}:</span> {s.value}
                </span>
              ))}
            </div>
          )}

          {/* Quantity + CTA */}
          <div className="flex gap-3 mb-6 border-t border-gray-100 pt-5">
            {!outOfStock && (
              <div className="flex items-center border border-gray-200 rounded-sm">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-11 h-11 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors disabled:opacity-30"
                >−</button>
                <span className="w-11 h-11 flex items-center justify-center font-bold border-x border-gray-200">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="w-11 h-11 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors disabled:opacity-30"
                >+</button>
              </div>
            )}

            {outOfStock ? (
              <div className="flex-1 flex flex-col gap-2">
                <button disabled className="w-full bg-gray-200 text-gray-500 text-sm font-bold uppercase tracking-wider py-3.5 rounded-full cursor-not-allowed">
                  Agotado
                </button>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`¡Hola! Quisiera realizar un pedido del producto: ${product.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold uppercase tracking-wider py-3.5 rounded-full flex items-center justify-center gap-2 transition-colors"
                >
                  {WA_ICON} Pedir por WhatsApp
                </a>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-2">
                <button
                  onClick={handleAddToCart}
                  className={`w-full text-sm font-bold uppercase tracking-wider py-3.5 rounded-full transition-all ${
                    added ? 'bg-green-600 text-white' : 'bg-black hover:bg-gray-800 text-white'
                  }`}
                >
                  {added ? '✓ Añadido al carrito' : 'Añadir al Carrito'}
                </button>
                {added && (
                  <Link
                    to="/cart"
                    className="w-full border border-black text-black text-sm font-bold uppercase tracking-wider py-3 rounded-full flex items-center justify-center transition-colors hover:bg-black hover:text-white"
                  >
                    Ver carrito
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* ── Accordion sections ───────────────────── */}
          {product.detailedDescription && product.detailedDescription !== product.description && (
            <Accordion title="Descripción detallada" defaultOpen>
              <p className="text-sm text-gray-600 leading-relaxed">{product.detailedDescription}</p>
            </Accordion>
          )}

          <Accordion title="Especificaciones técnicas" defaultOpen>
            <div className="divide-y divide-gray-50">
              {allSpecs.map(s => (
                <div key={s.label} className="flex items-start py-2 gap-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-28 flex-shrink-0 pt-0.5">{s.label}</span>
                  <span className={`text-sm font-medium ${s.value ? 'text-gray-800' : 'text-gray-300'}`}>
                    {s.value || '—'}
                  </span>
                </div>
              ))}
            </div>
          </Accordion>

          {product.components && (
            <Accordion title="¿Qué incluye?">
              <p className="text-sm text-gray-600 leading-relaxed">{product.components}</p>
            </Accordion>
          )}

          {/* Trust badges */}
          <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 mt-2">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-black">Envío a todo Colombia</p>
                <p className="text-xs text-gray-500">Gratis en pedidos superiores a $300.000 o desde Armenia, Quindío.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-black">Tiempo de entrega</p>
                <p className="text-xs text-gray-500">De 5 a 10 días hábiles.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-black">Compra Segura</p>
                <p className="text-xs text-gray-500">Garantía de 30 días.</p>
              </div>
            </div>
          </div>

          <Link
            to="/catalog"
            className="mt-6 flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-black transition-colors self-start"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
