import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, Clock } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function Cart() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) => state.getTotals().subtotal);

  const shippingThreshold = 300000;
  const shipping = subtotal >= shippingThreshold ? 0 : 15000; // Updated shipping cost and threshold
  const total = subtotal + shipping;
  const progress = Math.min((subtotal / shippingThreshold) * 100, 100);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-extrabold text-brand-charcoal-dark mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8">Parece que aún no has agregado productos a tu carrito de compras.</p>
        <Link 
          to="/catalog" 
          className="inline-flex items-center px-6 py-3 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-full hover:bg-gray-800 transition-colors"
        >
          Explorar Catálogo <ArrowRight className="ml-2 w-5 h-5 stroke-[1.5]" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-brand-charcoal-dark mb-8">Carrito de Compras</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-gray-50 font-semibold text-brand-charcoal-light text-sm tracking-wider uppercase">
              <div className="col-span-6">Producto</div>
              <div className="col-span-2 text-center">Precio</div>
              <div className="col-span-3 text-center">Cantidad</div>
              <div className="col-span-1"></div>
            </div>
            
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={`${item.product.id}-${item.size}`} className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-20 h-24 object-contain rounded-sm border border-gray-100 p-1 hidden sm:block"
                    />
                    <div>
                      <Link to={`/product/${item.product.id}`} className="font-bold text-black hover:text-gray-500 transition-colors block leading-tight">
                        {item.product.name}
                      </Link>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Capacidad: <span className="text-black">{item.size}</span></p>
                      <p className="sm:hidden text-black font-bold mt-2">${item.product.price.toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block col-span-2 text-center font-bold text-brand-charcoal-dark">
                    ${item.product.price.toLocaleString('es-CL')}
                  </div>
                  
                  <div className="col-span-1 sm:col-span-3 flex justify-center">
                    <div className="flex items-center border border-gray-300 rounded-sm">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-span-1 flex justify-end">
                    <button 
                      onClick={() => removeItem(item.product.id, item.size)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-sm sticky top-24">
            <h2 className="text-xl font-bold text-brand-charcoal-dark mb-6">Resumen del Pedido</h2>
            
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                  {subtotal >= shippingThreshold 
                    ? '¡Felicidades! Tienes envío gratis' 
                    : `Te faltan $${(shippingThreshold - subtotal).toLocaleString('es-CL')} para envío gratis`}
                </span>
                <span className="text-[10px] font-bold text-black">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-black transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Envío</span>
                {shipping === 0 ? (
                  <span className="text-green-600 font-bold">Gratis</span>
                ) : (
                  <span>${shipping.toLocaleString('es-CL')}</span>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-300 pt-4 mb-6">
              <div className="flex justify-between font-extrabold text-xl text-brand-charcoal-dark">
                <span>Total</span>
                <span>${total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 rounded-sm px-3 py-2 mb-6">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <p className="text-xs text-gray-500">Tiempo de entrega: <span className="font-bold text-black">5 a 10 días hábiles</span></p>
            </div>
            
            <Link 
              to="/checkout"
              className="w-full bg-black hover:bg-gray-800 text-white text-sm font-bold uppercase tracking-wider py-4 px-6 rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg"
            >
              Proceder al Pago
            </Link>
            
            <div className="mt-4 text-center">
              <Link to="/catalog" className="text-sm border-b border-gray-400 text-gray-500 hover:text-brand-charcoal transition-colors pb-1">
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
