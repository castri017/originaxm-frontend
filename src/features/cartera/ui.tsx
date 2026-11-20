import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import type { CustomerStatus, SaleStatus } from './types';

const STATUS_STYLE: Record<SaleStatus, { label: string; className: string }> = {
  AlDia:      { label: 'Al día',     className: 'bg-blue-50 text-blue-700 border-blue-100' },
  Vencida:    { label: 'Vencida',    className: 'bg-red-50 text-red-700 border-red-200' },
  Pagado:     { label: 'Pagado',     className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  Devolucion: { label: 'Devolución', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  SinVender:  { label: 'Sin vender', className: 'bg-amber-50 text-amber-700 border-amber-100' },
};

export function StatusBadge({ status, daysOverdue = 0 }: { status: SaleStatus | CustomerStatus; daysOverdue?: number }) {
  const style = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold border rounded-full whitespace-nowrap ${style.className}`}>
      {style.label}
      {status === 'Vencida' && daysOverdue > 0 && <span className="font-semibold">· {daysOverdue} d</span>}
    </span>
  );
}

export function Modal({ title, onClose, busy = false, wide = false, children }: {
  title: string; onClose: () => void; busy?: boolean; wide?: boolean; children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !busy && onClose()}>
      <div
        role="dialog" aria-modal="true" aria-label={title}
        className={`bg-white rounded-sm shadow-xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-extrabold text-black">{title}</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Cerrar"
            className="p-1.5 text-gray-400 hover:text-black rounded-sm hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, hint, tone = 'default' }: {
  label: string; value: string; hint?: string; tone?: 'default' | 'danger' | 'success' | 'warning';
}) {
  const color = {
    default: 'text-gray-900 border-gray-100',
    danger:  'text-red-600 border-red-100',
    success: 'text-emerald-600 border-emerald-100',
    warning: 'text-amber-600 border-amber-100',
  }[tone];
  return (
    <div className={`bg-white border rounded-sm p-4 shadow-sm ${color.split(' ')[1]}`}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${color.split(' ')[0]}`}>{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
