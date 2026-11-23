import { useState } from 'react';
import { Truck } from 'lucide-react';

/** Logo de la transportadora; si la imagen no está o no carga, muestra un camión */
export default function CarrierLogo({ src, name, className = 'h-7 w-auto max-w-[120px]' }: { src: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Truck className="w-4 h-4 text-brand-charcoal-light" aria-hidden="true" />;
  return <img src={src} alt={name} className={`object-contain ${className}`} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}
