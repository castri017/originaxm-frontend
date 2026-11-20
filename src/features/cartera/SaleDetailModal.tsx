import { useState } from 'react';
import { AlertCircle, Edit, Loader2, ShoppingBag, Trash2 } from 'lucide-react';
import { carteraApi } from './api';
import { formatDay, money, todayInColombia } from './format';
import { inputClass, labelClass, parseMoney, PAYMENT_METHODS, primaryButton, SALE_TYPE_LABEL, secondaryButton } from './styles';
import { Modal, StatusBadge } from './ui';
import VerifyDeleteModal from './VerifyDeleteModal';
import type { CreditPayment, CreditSaleDetail, PaymentMethod } from './types';

interface Props {
  sale: CreditSaleDetail;
  onClose: () => void;
  onEdit: (sale: CreditSaleDetail) => void;
  /** Vender un termo que está sin vender. */
  onSell: (sale: CreditSaleDetail) => void;
  /** Se llama tras cada cambio, con la venta actualizada (o null si se eliminó). */
  onChanged: (sale: CreditSaleDetail | null) => void;
}

export default function SaleDetailModal({ sale, onClose, onEdit, onSell, onChanged }: Props) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayInColombia());
  const [method, setMethod] = useState<PaymentMethod>('Nequi');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Lo que se va a eliminar, a la espera del código de verificación.
  const [pendingDelete, setPendingDelete] = useState<{ kind: 'sale' } | { kind: 'payment'; payment: CreditPayment } | null>(null);

  const receivable = sale.status !== 'Devolucion' && sale.status !== 'SinVender';

  const run = async (action: () => Promise<CreditSaleDetail | null>) => {
    setBusy(true);
    setError('');
    try {
      onChanged(await action());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la acción.');
    } finally {
      setBusy(false);
    }
  };

  const addPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseMoney(amount);
    if (value <= 0) { setError('Indica el valor del abono.'); return; }
    if (value > sale.balance) { setError(`El abono supera el saldo (${money(sale.balance)}).`); return; }
    run(async () => {
      const updated = await carteraApi.addPayment(sale.id, { amount: value, paymentDate: date, method, notes: notes.trim() || null });
      setAmount('');
      setNotes('');
      return updated;
    });
  };

  // El servidor valida el código; si es incorrecto, el error se muestra en la ventana del código.
  const confirmDelete = async (code: string) => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'sale') {
      await carteraApi.deleteSale(sale.id, code);
      setPendingDelete(null);
      onChanged(null);
    } else {
      await carteraApi.deletePayment(sale.id, pendingDelete.payment.id, code);
      setPendingDelete(null);
      onChanged(await carteraApi.sale(sale.id));
    }
  };

  return (
    <Modal title={sale.productName} onClose={onClose} busy={busy} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={sale.status} daysOverdue={sale.daysOverdue} />
          <span className="text-xs text-gray-500">{SALE_TYPE_LABEL[sale.type]}</span>
          {sale.type === 'Devolucion' && <span className="text-xs text-gray-500">· Bono Amazon {sale.voucherStatus?.toLowerCase()}</span>}
          {sale.collectionMethod === 'Sistecredito' && <span className="text-xs text-gray-500">· Sistecrédito (60 días)</span>}
          {!sale.productId && <span className="text-xs text-gray-400">· producto escrito a mano</span>}
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><dt className={labelClass}>Cliente</dt><dd className="font-semibold">{sale.customerName || 'Sin vender'}</dd></div>
          <div><dt className={labelClass}>Compra</dt><dd>{money(sale.purchasePrice)}<br /><span className="text-xs text-gray-400">{formatDay(sale.purchaseDate)}</span></dd></div>
          <div><dt className={labelClass}>Venta</dt><dd>{money(sale.sellingPrice)}<br /><span className="text-xs text-gray-400">{sale.saleDate ? formatDay(sale.saleDate) : 'Sin fecha'}</span></dd></div>
          <div><dt className={labelClass}>Ganancia</dt><dd className="text-emerald-600 font-semibold">{money(sale.margin)}</dd></div>
          <div><dt className={labelClass}>Abonado</dt><dd>{money(sale.amountPaid)}</dd></div>
          <div><dt className={labelClass}>Saldo</dt><dd className={`font-extrabold ${sale.balance > 0 ? 'text-red-600' : 'text-gray-900'}`}>{money(sale.balance)}</dd></div>
          <div><dt className={labelClass}>Vence</dt><dd>{formatDay(sale.dueDate)}</dd></div>
          {sale.notes && <div className="col-span-2 sm:col-span-4"><dt className={labelClass}>Notas</dt><dd className="text-gray-600">{sale.notes}</dd></div>}
        </dl>

        <section>
          <h3 className="text-sm font-extrabold text-black mb-2">Abonos</h3>
          {sale.payments.length === 0 ? (
            <p className="text-sm text-gray-400">Sin abonos.</p>
          ) : (
            <ul className="divide-y divide-gray-100 border border-gray-100 rounded-sm">
              {sale.payments.map(p => (
                <li key={p.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <span className="w-28 text-gray-500">{formatDay(p.paymentDate)}</span>
                  <span className="font-semibold w-28">{money(p.amount)}</span>
                  <span className="text-xs text-gray-500 w-24">{p.method}</span>
                  <span className="flex-1 text-xs text-gray-400 truncate">{p.notes}</span>
                  <button onClick={() => setPendingDelete({ kind: 'payment', payment: p })} disabled={busy} aria-label="Eliminar abono"
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-sm hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {receivable && sale.balance > 0 && (
          <form onSubmit={addPayment} noValidate className="border border-gray-100 rounded-sm p-4 space-y-3 bg-gray-50/50">
            <h3 className="text-sm font-extrabold text-black">Registrar abono</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className={labelClass} htmlFor="pay-amount">Valor</label>
                <input id="pay-amount" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)}
                  className={inputClass} placeholder={String(sale.balance)} />
              </div>
              <div>
                <label className={labelClass} htmlFor="pay-date">Fecha</label>
                <input id="pay-date" type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="pay-method">Medio</label>
                <select id="pay-method" value={method} onChange={e => setMethod(e.target.value as PaymentMethod)} className={inputClass}>
                  {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="pay-notes">Nota</label>
                <input id="pay-notes" value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} placeholder="Opcional" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={busy} className={primaryButton}>
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Registrar abono
              </button>
            </div>
          </form>
        )}

        {error && (
          <p role="alert" className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </p>
        )}

        <div className="flex justify-between pt-2 border-t border-gray-100">
          <button onClick={() => setPendingDelete({ kind: 'sale' })} disabled={busy} className={`${secondaryButton} text-red-600 hover:bg-red-50`}>
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </button>
          <div className="flex gap-2">
            <button onClick={() => onEdit(sale)} disabled={busy} className={secondaryButton}>
              <Edit className="w-3.5 h-3.5" /> Editar
            </button>
            {sale.status === 'SinVender' && (
              <button onClick={() => onSell(sale)} disabled={busy} className={primaryButton}>
                <ShoppingBag className="w-4 h-4" /> Vender
              </button>
            )}
          </div>
        </div>
      </div>

      {pendingDelete && (
        <VerifyDeleteModal
          title={pendingDelete.kind === 'sale' ? 'Eliminar venta' : 'Eliminar abono'}
          description={pendingDelete.kind === 'sale'
            ? `Se eliminará "${sale.productName}"${sale.customerName ? ` de ${sale.customerName}` : ''} con todos sus abonos.`
            : `Se eliminará el abono de ${money(pendingDelete.payment.amount)} del ${formatDay(pendingDelete.payment.paymentDate)}.`}
          onConfirm={confirmDelete}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </Modal>
  );
}
