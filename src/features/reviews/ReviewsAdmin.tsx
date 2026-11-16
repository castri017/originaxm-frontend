import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, Loader2, RefreshCw, Trash2, X } from 'lucide-react';
import { deleteReview, fetchAdminReviews, setReviewStatus } from './api';
import { Stars } from './Stars';
import type { AdminReview, ReviewStatus } from './types';

const FILTERS: { status: ReviewStatus; label: string }[] = [
  { status: 'Pendiente', label: 'Pendientes' },
  { status: 'Aprobada',  label: 'Aprobadas'  },
  { status: 'Rechazada', label: 'Rechazadas' },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function ReviewsAdmin() {
  const [status, setStatus] = useState<ReviewStatus>('Pendiente');
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setReviews(await fetchAdminReviews(status));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las reseñas.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  const act = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    setError('');
    try {
      await action();
      // Sale de la lista actual: ya no tiene el estado filtrado.
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la acción.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = (r: AdminReview) => {
    if (!window.confirm(`¿Eliminar la reseña de ${r.authorName}? Esta acción no se puede deshacer.`)) return;
    void act(r.id, () => deleteReview(r.id));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-sm">
          {FILTERS.map(f => (
            <button
              key={f.status}
              onClick={() => setStatus(f.status)}
              className={`px-4 py-2 text-sm font-semibold rounded-sm transition-colors ${status === f.status ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={() => void load()} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">No hay reseñas {status.toLowerCase() === 'pendiente' ? 'pendientes' : status === 'Aprobada' ? 'aprobadas' : 'rechazadas'}.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map(r => (
            <li key={r.id} className="bg-white border border-gray-200 rounded-sm p-5 flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars value={r.rating} />
                  <span className="text-sm font-bold text-gray-900">{r.authorName}</span>
                  <span className="text-xs text-gray-400">{r.customerEmail}</span>
                </div>
                <p className="text-xs font-semibold text-gray-500">{r.productName} <span className="font-mono text-gray-400">· {r.productCode}</span></p>
                {r.comment
                  ? <p className="text-sm text-gray-700 whitespace-pre-line">{r.comment}</p>
                  : <p className="text-sm text-gray-400 italic">Sin comentario, solo calificación.</p>}
                <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
              </div>

              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                {r.status !== 'Aprobada' && (
                  <button disabled={busyId === r.id} onClick={() => void act(r.id, () => setReviewStatus(r.id, 'Aprobada'))}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-green-600 text-white rounded-sm hover:bg-green-700 disabled:opacity-50">
                    <Check className="w-3.5 h-3.5" /> Aprobar
                  </button>
                )}
                {r.status !== 'Rechazada' && (
                  <button disabled={busyId === r.id} onClick={() => void act(r.id, () => setReviewStatus(r.id, 'Rechazada'))}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 disabled:opacity-50">
                    <X className="w-3.5 h-3.5" /> Rechazar
                  </button>
                )}
                <button disabled={busyId === r.id} onClick={() => remove(r)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 rounded-sm hover:bg-red-50 disabled:opacity-50">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
