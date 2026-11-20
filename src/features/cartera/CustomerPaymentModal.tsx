import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { carteraApi } from './api';
import { money, todayInColombia } from './format';
import { inputClass, labelClass, parseMoney, PAYMENT_METHODS, primaryButton } from './styles';
import { Modal } from './ui';
import type { CreditCustomer, PaymentMethod } from './types';

interface Props {
  customer: CreditCustomer;
  onClose: () => void;
  onSaved: (message: string) => void;
}

/** Abono de un cliente que se reparte solo entre sus ventas con saldo, de la más antigua a la más reciente. */
export default function CustomerPaymentModal({ customer, onClose, onSaved }: Props) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayInColombia());
  const [method, setMethod] = useState<PaymentMethod>('Nequi');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseMoney(amount);
    if (value <= 0) { setError('Indica el valor del abono.'); return; }
    if (value > customer.balance) { setError(`El abono supera lo que debe (${money(customer.balance)}).`); return; }

    setSaving(true);
    setError('');
    try {
      const result = await carteraApi.addCustomerPayment({
        customerId: customer.customerId,
        customerName: customer.customerId ? null : customer.customerName,
        amount: value, paymentDate: date, method, notes: notes.trim() || null,
      });
      onSaved(`Abono de ${money(result.applied)} repartido en ${result.salesAffected} venta${result.salesAffected !== 1 ? 's' : ''} de ${customer.customerName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el abono.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Abono de ${customer.customerName}`} onClose={onClose} busy={saving}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <p className="text-sm text-gray-600">
          Debe <span className="font-bold text-black">{money(customer.balance)}</span> en {customer.pendingCount} venta{customer.pendingCount !== 1 ? 's' : ''}.
          El abono se aplica primero a la venta más antigua.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="cpay-amount">Valor</label>
            <input id="cpay-amount" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} className={inputClass} autoFocus />
          </div>
          <div>
            <label className={labelClass} htmlFor="cpay-date">Fecha</label>
            <input id="cpay-date" type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="cpay-method">Medio</label>
            <select id="cpay-method" value={method} onChange={e => setMethod(e.target.value as PaymentMethod)} className={inputClass}>
              {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="cpay-notes">Nota</label>
            <input id="cpay-notes" value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} placeholder="Opcional" />
          </div>
        </div>
        {error && (
          <p role="alert" className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </p>
        )}
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className={primaryButton}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Registrar abono
          </button>
        </div>
      </form>
    </Modal>
  );
}
