import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Orden dentro de un grupo, para escalonar la entrada */
  index?: number;
  className?: string;
}

/** Hace aparecer su contenido la primera vez que entra en pantalla. */
export default function Reveal({ children, index = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Sin IntersectionObserver (navegadores muy viejos) el contenido se muestra de una vez.
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ '--i': index } as CSSProperties}
    >
      {children}
    </div>
  );
}
