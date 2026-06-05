import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export default function FloatingCartButton() {
  const itemsCount = useCartStore((s) => s.getTotals().itemsCount);
  const subtotal   = useCartStore((s) => s.getTotals().subtotal);

  if (itemsCount === 0) return null;

  return (
    <Link
      to="/cart"
      className="sm:hidden fixed bottom-20 right-4 z-30 bg-black text-white flex items-center gap-2 pl-4 pr-3 py-3 rounded-full shadow-lg active:scale-95 transition-transform"
      aria-label={`Ver carrito (${itemsCount} productos)`}
    >
      <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
      <span className="text-sm font-bold">${subtotal.toLocaleString('es-CL')}</span>
      <span className="bg-white text-black text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
        {itemsCount > 9 ? '9+' : itemsCount}
      </span>
    </Link>
  );
}
