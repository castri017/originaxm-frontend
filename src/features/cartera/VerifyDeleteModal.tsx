import { useState } from 'react';
import { AlertCircle, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { inputClass, labelClass } from './styles';
import { Modal } from './ui';

interface Props {
  title: string;
  /** Qué se va a eliminar, en una o dos líneas. */
  description: string;
  /** Recibe el código escrito; si el servidor lo rechaza, lanza el error que se muestra. */
  onConfirm: (code: string) => Promise<void>;
  onClose: () => void;
}

/** Confirma una eliminación con el código de verificación del administrador. */
export default function VerifyDeleteModal({ title, description, onConfirm, onClose }: Props) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setError('Escribe el código de verificación.'); return; }
    setBusy(true);
    setError('');
    try {
      await onConfirm(code.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar.');
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose} busy={busy}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-sm text-red-600 font-semibold">Esta acción no se puede deshacer.</p>
        <div>
          <label className={labelClass} htmlFor="verify-code">Código de verificación</label>
          <div className="relative">
            <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input id="verify-code" type="password" value={code} onChange={e => setCode(e.target.value)}
              className={`${inputClass} pl-9`} autoComplete="off" autoFocus />
          </div>
        </div>
        {error && (
          <p role="alert" className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={busy}
            className="px-5 py-2.5 text-sm font-bold border border-gray-200 rounded-full hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={busy}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-full hover:bg-red-700 disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Eliminar
          </button>
        </div>
      </form>
    </Modal>
  );
}
