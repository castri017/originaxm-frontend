import { API } from '../../config/api';
import { adminFetch } from '../../lib/adminFetch';
import type { Promotion, PromotionInput } from './types';

const BASE = `${API}/api/promotions`;

async function readError(res: Response, fallback: string): Promise<Error> {
  const body = await res.json().catch(() => ({}));
  return new Error(body.message ?? body.title ?? fallback);
}

/** Público: promociones vigentes, para el popup y el catálogo. */
export async function fetchActivePromotions(signal?: AbortSignal): Promise<Promotion[]> {
  const res = await fetch(`${BASE}/active`, { signal });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchPromotions(): Promise<Promotion[]> {
  const res = await adminFetch(BASE);
  if (!res.ok) throw await readError(res, 'No se pudieron cargar las promociones.');
  return res.json();
}

export async function savePromotion(input: PromotionInput, id?: string): Promise<void> {
  const res = await adminFetch(id ? `${BASE}/${id}` : BASE, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await readError(res, 'No se pudo guardar la promoción.');
}

export async function deletePromotion(id: string): Promise<void> {
  const res = await adminFetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw await readError(res, 'No se pudo eliminar la promoción.');
}

/** Sube la imagen y devuelve su URL pública. */
export async function uploadPromotionImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('files', file);
  const res = await adminFetch(`${API}/api/uploads/promotions`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) throw await readError(res, 'Error al subir la imagen.');
  const data: { paths: string[] } = await res.json();
  return data.paths[0];
}
