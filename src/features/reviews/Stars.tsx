import { Star } from 'lucide-react';

const FIVE = [0, 1, 2, 3, 4];

/** Estrellas de solo lectura; admite decimales (4.5 pinta cuatro y media). */
export function Stars({ value, className = 'w-4 h-4' }: { value: number; className?: string }) {
  const percent = (Math.max(0, Math.min(5, value)) / 5) * 100;
  return (
    <span className="relative inline-flex" role="img" aria-label={`${value} de 5 estrellas`}>
      <span className="flex text-brand-line" aria-hidden="true">
        {FIVE.map(i => <Star key={i} className={`${className} fill-current flex-shrink-0`} />)}
      </span>
      <span className="absolute inset-y-0 left-0 flex overflow-hidden text-brand-copper-light" style={{ width: `${percent}%` }} aria-hidden="true">
        {FIVE.map(i => <Star key={i} className={`${className} fill-current flex-shrink-0`} />)}
      </span>
    </span>
  );
}

const LABELS = ['Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

/** Selector de 1 a 5 estrellas, usable con teclado (flechas) y lector de pantalla. */
export function StarInput({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Calificación" className="flex items-center gap-1">
      {FIVE.map(i => {
        const star = i + 1;
        const selected = star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}: ${LABELS[i]}`}
            tabIndex={star === (value || 1) ? 0 : -1}
            onClick={() => onChange(star)}
            onKeyDown={e => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(5, (value || 0) + 1)); }
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(1, (value || 2) - 1)); }
            }}
            className="p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-brand-charcoal-dark"
          >
            <Star className={`w-8 h-8 ${selected ? 'fill-brand-copper-light text-brand-copper-light' : 'text-brand-line'}`} />
          </button>
        );
      })}
      <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.1em] text-brand-muted min-w-20">
        {value > 0 ? LABELS[value - 1] : 'Elige'}
      </span>
    </div>
  );
}
