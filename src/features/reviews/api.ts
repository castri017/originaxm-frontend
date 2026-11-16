import { API } from '../../config/api';
import { adminFetch } from '../../lib/adminFetch';
import { customerFetch } from '../../lib/customerFetch';
import type {
  AdminReview, MyReview, ProductReviews, RatingSummary, ReviewEligibility, ReviewStatus,
} from './types';

async function readError(res: Response, fallback: string): Promise<Error> {
  const body = await res.json().catch(() => ({}));
  return new Error(body.message ?? body.title ?? fallback);
}

/** Público: reseñas aprobadas de un producto con su resumen. */
export async function fetchProductReviews(productId: string, signal?: AbortSignal): Promise<ProductReviews> {
  const res = await fetch(`${API}/api/products/${productId}/reviews`, { signal });
  if (!res.ok) throw new Error('No se pudieron cargar las opiniones.');
  return res.json();
}

/** Público: promedio y total por producto, para las tarjetas. Si falla, la tienda sigue sin estrellas. */
export async function fetchRatingSummaries(signal?: AbortSignal): Promise<RatingSummary[]> {
  const res = await fetch(`${API}/api/reviews/summaries`, { signal });
  if (!res.ok) return [];
  return res.json();
}

/** Cliente: ¿puede opinar sobre este producto? ¿ya lo hizo? */
export async function fetchMyReview(productId: string): Promise<ReviewEligibility> {
  const res = await customerFetch(`${API}/api/products/${productId}/reviews/mine`);
  if (!res.ok) throw await readError(res, 'No se pudo verificar tu compra.');
  return res.json();
}

export async function submitReview(productId: string, input: { rating: number; comment: string }): Promise<MyReview> {
  const res = await customerFetch(`${API}/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await readError(res, 'No se pudo enviar tu opinión.');
  return res.json();
}

// ── Administración ──────────────────────────────────────────────────

export async function fetchAdminReviews(status?: ReviewStatus): Promise<AdminReview[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await adminFetch(`${API}/api/reviews${qs}`);
  if (!res.ok) throw await readError(res, 'No se pudieron cargar las reseñas.');
  return res.json();
}

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  const res = await adminFetch(`${API}/api/reviews/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw await readError(res, 'No se pudo actualizar la reseña.');
}

export async function deleteReview(id: string): Promise<void> {
  const res = await adminFetch(`${API}/api/reviews/${id}`, { method: 'DELETE' });
  if (!res.ok) throw await readError(res, 'No se pudo eliminar la reseña.');
}
