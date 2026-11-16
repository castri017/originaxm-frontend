import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Clock, Loader2 } from 'lucide-react';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';
import { useMyReview, useProductReviews, useRatingSummaries, useSubmitReview } from './queries';
import { StarInput, Stars } from './Stars';
import { MAX_COMMENT_LENGTH, type MyReview } from './types';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

const plural = (n: number) => `${n} ${n === 1 ? 'opinión' : 'opiniones'}`;

/** Enlace bajo el título de la ficha: "★★★★☆ 4.5 · 12 opiniones". No se muestra sin reseñas. */
export function RatingLink({ productId }: { productId: string }) {
  const summary = useRatingSummaries().get(productId);
  if (!summary || summary.count === 0) return null;
  return (
    <a href="#opiniones" className="inline-flex items-center gap-2 self-start text-[13px] text-brand-charcoal-light hover:text-brand-charcoal-dark transition-colors">
      <Stars value={summary.average} />
      <span className="font-display font-bold text-brand-charcoal-dark">{summary.average.toFixed(1)}</span>
      <span className="underline underline-offset-2">{plural(summary.count)}</span>
    </a>
  );
}

/** Promedio compacto para la tarjeta del catálogo. */
export function CardRating({ productId }: { productId: string }) {
  const summary = useRatingSummaries().get(productId);
  if (!summary || summary.count === 0) return null;
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-brand-charcoal-light" title={`${summary.average} de 5 · ${plural(summary.count)}`}>
      <Stars value={summary.average} className="w-3.5 h-3.5" />
      <span className="font-display font-bold text-brand-charcoal-dark">{summary.average.toFixed(1)}</span>
      <span>({summary.count})</span>
    </span>
  );
}

function Summary({ average, count, distribution }: { average: number; count: number; distribution: number[] }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
      <div className="flex flex-col gap-1.5">
        <span className="font-display font-extrabold text-[48px] leading-none text-brand-charcoal-dark">{average.toFixed(1)}</span>
        <Stars value={average} className="w-5 h-5" />
        <span className="text-[13px] text-brand-charcoal-light">{plural(count)}</span>
      </div>
      <ul className="flex-1 max-w-sm flex flex-col gap-1.5" aria-label="Opiniones por estrella">
        {[5, 4, 3, 2, 1].map(star => {
          const n = distribution[star - 1] ?? 0;
          return (
            <li key={star} className="flex items-center gap-2.5 text-[12px] text-brand-charcoal-light">
              <span className="w-10 font-mono">{star} ★</span>
              <span className="flex-1 h-1.5 bg-brand-sand-dark overflow-hidden">
                <span className="block h-full bg-brand-copper-light" style={{ width: count ? `${(n / count) * 100}%` : '0%' }} />
              </span>
              <span className="w-6 text-right font-mono">{n}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MyReviewNotice({ review }: { review: MyReview }) {
  const note = review.status === 'Aprobada'
    ? 'Tu opinión ya está publicada. ¡Gracias!'
    : review.status === 'Rechazada'
      ? 'Tu opinión no cumplió las normas de la tienda y no se publicó.'
      : 'Recibimos tu opinión. La revisaremos y aparecerá aquí cuando la aprobemos.';
  return (
    <div className="border border-brand-line bg-brand-sand-dark/50 p-4 flex flex-col gap-2">
      <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-brand-muted">
        <Clock className="w-3.5 h-3.5" aria-hidden="true" /> Tu opinión · {review.status === 'Pendiente' ? 'en revisión' : review.status.toLowerCase()}
      </span>
      <Stars value={review.rating} />
      {review.comment && <p className="text-[14px] text-brand-charcoal">{review.comment}</p>}
      <p className="text-[13px] text-brand-charcoal-light">{note}</p>
    </div>
  );
}

function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const submit = useSubmitReview(productId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    submit.mutate({ rating, comment: comment.trim() });
  };

  return (
    <form onSubmit={onSubmit} className="border border-brand-line p-5 flex flex-col gap-4">
      <h3 className="font-display font-bold text-[17px] text-brand-charcoal-dark">Cuéntanos qué tal te pareció</h3>
      <StarInput value={rating} onChange={setRating} />
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-brand-muted">Comentario (opcional)</span>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={MAX_COMMENT_LENGTH}
          rows={4}
          placeholder="¿Mantiene la temperatura? ¿Cómo es la calidad? ¿Lo recomendarías?"
          className="w-full border border-brand-line px-3 py-2.5 text-[14px] focus:outline-none focus:border-brand-charcoal-dark resize-y"
        />
        <span className="self-end font-mono text-[10.5px] text-brand-muted">{comment.length}/{MAX_COMMENT_LENGTH}</span>
      </label>
      {submit.isError && (
        <p role="alert" className="text-[13px] text-brand-urgent">{submit.error.message}</p>
      )}
      <button type="submit" disabled={rating === 0 || submit.isPending} className="btn-primary self-start disabled:opacity-40 disabled:cursor-not-allowed">
        {submit.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Enviar opinión
      </button>
      <p className="text-[12px] text-brand-muted">Se publica con tu nombre y la inicial de tu apellido, después de que la revisemos.</p>
    </form>
  );
}

/** Qué ve el cliente según su sesión y si compró el producto. */
function Participation({ productId }: { productId: string }) {
  const isAuthenticated = useCustomerAuthStore(s => s.isAuthenticated);
  const mine = useMyReview(productId);

  if (!isAuthenticated) {
    return (
      <p className="text-[14px] text-brand-charcoal-light border border-brand-line p-4">
        <Link to="/login" className="font-semibold text-brand-charcoal-dark underline underline-offset-2">Inicia sesión</Link>{' '}
        para opinar si ya compraste este producto.
      </p>
    );
  }
  if (mine.isPending) return <div className="h-24 skeleton" aria-busy="true" />;
  if (mine.isError) return <p className="text-[13px] text-brand-muted">No pudimos verificar tu compra. Intenta de nuevo más tarde.</p>;

  const { canReview, reason, review } = mine.data;
  if (review) return <MyReviewNotice review={review} />;
  if (canReview) return <ReviewForm productId={productId} />;
  return (
    <p className="text-[14px] text-brand-charcoal-light border border-brand-line p-4">
      {reason === 'NotPurchased'
        ? 'Solo quienes ya recibieron este producto pueden opinar. Así todas las opiniones son de compras reales.'
        : 'No puedes opinar sobre este producto en este momento.'}
    </p>
  );
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { data, isPending, isError } = useProductReviews(productId);

  return (
    <section id="opiniones" aria-labelledby="opiniones-titulo" className="mt-16 pt-10 border-t border-brand-line scroll-mt-24">
      <h2 id="opiniones-titulo" className="font-display font-extrabold text-[24px] tracking-[-0.02em] text-brand-charcoal-dark mb-6">
        Opiniones de clientes
      </h2>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-start">
        <div className="flex flex-col gap-8">
          {isPending ? (
            <div className="h-32 skeleton" aria-busy="true" />
          ) : isError ? (
            <p className="text-[14px] text-brand-muted">No se pudieron cargar las opiniones.</p>
          ) : data.count === 0 ? (
            <p className="text-[14px] text-brand-charcoal-light">Aún no hay opiniones de este producto. ¡Sé el primero en opinar!</p>
          ) : (
            <>
              <Summary average={data.average} count={data.count} distribution={data.distribution} />
              <ul className="flex flex-col">
                {data.items.map(r => (
                  <li key={r.id} className="py-5 border-t border-brand-line flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Stars value={r.rating} />
                      <span className="font-display font-bold text-[14px] text-brand-charcoal-dark">{r.authorName}</span>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-brand-stock">
                        <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" /> Compra verificada
                      </span>
                    </div>
                    {r.comment && <p className="text-[14px] leading-relaxed text-brand-charcoal whitespace-pre-line">{r.comment}</p>}
                    <time dateTime={r.createdAt} className="text-[12px] text-brand-muted">{formatDate(r.createdAt)}</time>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <Participation productId={productId} />
      </div>
    </section>
  );
}
