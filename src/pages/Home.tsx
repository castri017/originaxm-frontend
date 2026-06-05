import { Link } from 'react-router-dom';
import { API } from '../config/api';
import { useRef, useEffect, useState } from 'react';
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight, Package, Star } from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import FloatingCartButton from '../components/layout/FloatingCartButton';

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
}

export default function Home() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState<ApiProduct[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const onImgError = (id: string) => setImgErrors(s => new Set(s).add(id));
  const catalogVersion = useCatalogStore((s) => s.version);

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

  useEffect(() => {
    setLoading(true);
    setRecLoading(true);
    loadProducts();
    loadRecommended();
    const timer = setInterval(() => { loadProducts(); loadRecommended(); }, 60000);
    return () => clearInterval(timer);
  }, [catalogVersion]);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  const getImage = (p: ApiProduct) =>
    p.images?.[0]
      ? (p.images[0].startsWith('http') ? p.images[0] : `http://localhost:5173${p.images[0]}`)
      : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative h-[35vh] 2xl:h-[45vh] bg-gray-100 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=2000"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl 2xl:text-7xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
              Mantén el calor <br />
              <span className="text-white">en cada aventura.</span>
            </h1>
            <p className="text-xl text-white font-medium mb-8 drop-shadow-md">
              Descubre la colección oficial de Termos Stanley. Accesorios originales y duraderos con garantía de por vida.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center justify-center px-8 py-4 text-sm uppercase tracking-wider font-bold rounded-sm text-white bg-black hover:bg-gray-800 transition-all duration-300"
            >
              Comprar Ahora
              <ShoppingBag className="ml-2 w-5 h-5 stroke-[1.5]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Productos Recomendados */}
      {(recLoading || recommended.length > 0) && (
        <section className="py-14 bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-10">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-black">Productos Recomendados</h2>
            </div>

            {recLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-gray-200 mb-3 rounded-sm" />
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
                {recommended.map((product) => {
                  const img = getImage(product);
                  return (
                    <Link key={product.id} to={`/product/${product.id}`} className="group cursor-pointer flex flex-col">
                      <div className="relative aspect-[3/4] overflow-hidden bg-white mb-3 border border-gray-100 flex items-center justify-center p-3">
                        {img && !imgErrors.has(`rec-${product.id}`) ? (
                          <img src={img} alt={product.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" onError={() => onImgError(`rec-${product.id}`)} />
                        ) : (
                          <Package className="w-14 h-14 text-gray-200" />
                        )}
                        {product.stock <= 0 ? (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-sm">Sin Stock</span>
                        ) : (
                          <span className="absolute top-2 left-2 flex items-center gap-1 bg-amber-400 text-white text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-sm">
                            <Star className="w-2.5 h-2.5 fill-white" /> Top
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-black leading-tight mb-1 flex-grow line-clamp-2">{product.name}</h3>
                      {product.manufacturer && <p className="text-xs text-gray-400 mb-1">{product.manufacturer}</p>}
                      {product.sellingPrice > 0 && (() => {
                        const fp = product.discountPercentage > 0 ? Math.round(product.sellingPrice * (1 - product.discountPercentage / 100)) : product.sellingPrice;
                        return (
                          <div className="mb-2">
                            <div className="flex items-center gap-1.5">
                              <p className="text-base font-bold text-black">${fp.toLocaleString('es-CL')}</p>
                              {product.discountPercentage > 0 && <span className="bg-red-500 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-full">-{product.discountPercentage}%</span>}
                            </div>
                            {product.discountPercentage > 0 && <p className="text-[10px] text-gray-400 line-through">${product.sellingPrice.toLocaleString('es-CL')}</p>}
                          </div>
                        );
                      })()}
                      <button className="w-full py-2.5 bg-[#333333] hover:bg-black text-white text-sm font-bold rounded-full transition-colors flex items-center justify-center">
                        Ver Producto
                      </button>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Slider de productos */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-black">Novedades Destacadas</h2>
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className="p-2 border border-gray-200 rounded-full hover:bg-black hover:text-white transition-all duration-300">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => scroll('right')} className="p-2 border border-gray-200 rounded-full hover:bg-black hover:text-white transition-all duration-300">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64 animate-pulse">
                  <div className="aspect-[4/5] bg-gray-100 mb-4" />
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay productos disponibles aún.</p>
            </div>
          ) : (
            <div
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              {products.map((product) => {
                const img = getImage(product);
                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group relative flex-shrink-0 w-64 snap-start flex flex-col"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 mb-4 border border-gray-100 p-2 flex items-center justify-center">
                      {img && !imgErrors.has(`slider-${product.id}`) ? (
                        <img src={img} alt={product.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" onError={() => onImgError(`slider-${product.id}`)} />
                      ) : (
                        <Package className="w-12 h-12 text-gray-200" />
                      )}
                      {product.stock <= 0 && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-sm">Sin Stock</span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-black tracking-widest uppercase mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    {product.sellingPrice > 0 && (() => {
                      const fp = product.discountPercentage > 0 ? Math.round(product.sellingPrice * (1 - product.discountPercentage / 100)) : product.sellingPrice;
                      return (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-black">${fp.toLocaleString('es-CL')}</p>
                            {product.discountPercentage > 0 && <span className="bg-red-500 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-full">-{product.discountPercentage}%</span>}
                          </div>
                          {product.discountPercentage > 0 && <p className="text-[10px] text-gray-400 line-through">${product.sellingPrice.toLocaleString('es-CL')}</p>}
                        </div>
                      );
                    })()}
                    {product.stock <= 0 ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Agotado</span>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`https://wa.me/573216481430?text=${encodeURIComponent(`¡Hola! Quisiera realizar un pedido del producto: ${product.name}`)}`, '_blank'); }}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#25D366] hover:text-[#128C7E] uppercase tracking-wider transition-colors"
                        >
                          <svg className="w-3 h-3 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                          Pedir por WA
                        </button>
                      </div>
                    ) : (
                      product.manufacturer && <p className="text-xs text-gray-400 uppercase tracking-wider">{product.manufacturer}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Grid de productos */}
      {!loading && products.length > 0 && (
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-black">
                A los clientes les encanta
              </h2>
              <Link to="/catalog" className="hidden sm:flex items-center text-sm font-bold uppercase tracking-wider text-black hover:text-gray-500 transition-colors">
                Ver todos <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-x-8 gap-y-12">
              {products.slice(0, 8).map((product) => {
                const img = getImage(product);
                return (
                  <Link key={product.id} to={`/product/${product.id}`} className="group cursor-pointer flex flex-col">
                    <div className="relative aspect-[3/4] overflow-hidden bg-white mb-4 border border-gray-100 flex items-center justify-center p-4">
                      {img && !imgErrors.has(`grid-${product.id}`) ? (
                        <img src={img} alt={product.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" onError={() => onImgError(`grid-${product.id}`)} />
                      ) : (
                        <Package className="w-16 h-16 text-gray-200" />
                      )}
                      {product.stock <= 0 ? (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-sm">Sin Stock</span>
                      ) : (
                        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider text-black flex items-center gap-1">
                          <span className="text-xs">★</span> Nuevo
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-black leading-tight mb-1 flex-grow line-clamp-2">
                      {product.name}
                    </h3>
                    {product.manufacturer && (
                      <p className="text-xs text-gray-400 mb-1">{product.manufacturer}</p>
                    )}
                    {product.sellingPrice > 0 && (() => {
                      const fp = product.discountPercentage > 0 ? Math.round(product.sellingPrice * (1 - product.discountPercentage / 100)) : product.sellingPrice;
                      return (
                        <div className="mb-2">
                          <div className="flex items-center gap-1.5">
                            <p className="text-base font-bold text-black">${fp.toLocaleString('es-CL')}</p>
                            {product.discountPercentage > 0 && <span className="bg-red-500 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-full">-{product.discountPercentage}%</span>}
                          </div>
                          {product.discountPercentage > 0 && <p className="text-[10px] text-gray-400 line-through">${product.sellingPrice.toLocaleString('es-CL')}</p>}
                        </div>
                      );
                    })()}
                    {product.stock <= 0 ? (
                      <div className="flex flex-col gap-2">
                        <span className="w-full py-3 bg-gray-200 text-gray-500 text-sm font-bold rounded-full flex items-center justify-center cursor-not-allowed">
                          Agotado
                        </span>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`https://wa.me/573216481430?text=${encodeURIComponent(`¡Hola! Quisiera realizar un pedido del producto: ${product.name}`)}`, '_blank'); }}
                          className="w-full py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold rounded-full flex items-center justify-center gap-2 transition-colors"
                        >
                          <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                          Pedir por WhatsApp
                        </button>
                      </div>
                    ) : (
                      <button className="w-full py-3 bg-[#333333] hover:bg-black text-white text-sm font-bold rounded-full transition-colors flex items-center justify-center">
                        Ver Producto
                      </button>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="mt-12 sm:hidden text-center">
              <Link to="/catalog" className="inline-flex items-center text-sm font-bold uppercase tracking-wider text-black hover:text-gray-500 transition-colors">
                Ver todos los productos <ArrowRight className="ml-2 w-4 h-4 stroke-[1.5]" />
              </Link>
            </div>
          </div>
        </section>
      )}
      <FloatingCartButton />
    </div>
  );
}
