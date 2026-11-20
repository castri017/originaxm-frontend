import { useState } from 'react';
import { AlertCircle, Edit, HandCoins, Loader2, Plus, Trash2 } from 'lucide-react';
import { carteraApi } from './api';
import { dayOf, formatDay, money, todayInColombia } from './format';
import { inputClass, labelClass, parseMoney, PAYMENT_METHODS, primaryButton, secondaryButton } from './styles';
import { Modal } from './ui';
import VerifyDeleteModal from './VerifyDeleteModal';
import type { Loan, LoanInput, LoanInterestPayment, LoanStatus, PaymentMethod } from './types';

interface Props {
  loans: Loan[];
  onChanged: (message?: string) => void;
}

const LOAN_STATUS: Record<LoanStatus, { label: string; className: string }> = {
  AlDia:   { label: 'Al día',  className: 'bg-blue-50 text-blue-700 border-blue-100' },
  EnMora:  { label: 'En mora', className: 'bg-red-50 text-red-700 border-red-200' },
  Saldado: { label: 'Saldado', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const s = LOAN_STATUS[status];
  return <span className={`inline-flex px-2 py-0.5 text-[11px] font-bold border rounded-full ${s.className}`}>{s.label}</span>;
}

/** Interés en porcentaje: acepta "10", "2,5" o "2.5". */
const parsePercent = (text: string) => Number(text.replace(',', '.').replace(/[^\d.]/g, '')) || 0;

function LoanFormModal({ loan, onClose, onSaved }: { loan: Loan | null; onClose: () => void; onSaved: () => void }) {
  const [borrower, setBorrower] = useState(loan?.borrowerName ?? '');
  const [principal, setPrincipal] = useState(loan ? String(loan.principal) : '');
  const [rate, setRate] = useState(loan ? String(loan.monthlyRatePercent).replace('.', ',') : '');
  const [loanDate, setLoanDate] = useState(dayOf(loan?.loanDate) ?? todayInColombia());
  const [collectionDay, setCollectionDay] = useState(loan ? String(loan.collectionDay) : String(Number(todayInColombia().slice(8, 10))));
  const [paidOff, setPaidOff] = useState(dayOf(loan?.paidOffDate) ?? '');
  const [notes, setNotes] = useState(loan?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const amount = parseMoney(principal);
  const percent = parsePercent(rate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrower.trim()) { setError('Indica a quién se le prestó.'); return; }
    if (amount <= 0) { setError('Indica el valor prestado.'); return; }
    const day = Number(collectionDay);
    if (!Number.isInteger(day) || day < 1 || day > 31) { setError('El día de cobro debe estar entre 1 y 31.'); return; }

    const input: LoanInput = {
      borrowerName: borrower.trim(), principal: amount, monthlyRatePercent: percent,
      loanDate, collectionDay: day, paidOffDate: paidOff || null, notes: notes.trim(),
    };
    setSaving(true);
    setError('');
    try {
      if (loan) await carteraApi.updateLoan(loan.id, input);
      else await carteraApi.createLoan(input);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el préstamo.');
      setSaving(false);
    }
  };

  return (
    <Modal title={loan ? 'Editar préstamo' : 'Nuevo préstamo'} onClose={onClose} busy={saving}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="loan-borrower">Persona *</label>
          <input id="loan-borrower" value={borrower} onChange={e => setBorrower(e.target.value)} className={inputClass} autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="loan-principal">Valor prestado *</label>
            <input id="loan-principal" inputMode="numeric" value={principal} onChange={e => setPrincipal(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="loan-rate">Interés mensual (%)</label>
            <input id="loan-rate" inputMode="decimal" value={rate} onChange={e => setRate(e.target.value)} className={inputClass} placeholder="10" />
          </div>
          <div>
            <label className={labelClass} htmlFor="loan-date">Fecha del préstamo</label>
            <input id="loan-date" type="date" value={loanDate} onChange={e => setLoanDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="loan-day">Día de cobro (cada mes)</label>
            <input id="loan-day" type="number" min={1} max={31} value={collectionDay} onChange={e => setCollectionDay(e.target.value)} className={inputClass} />
          </div>
        </div>
        {amount > 0 && percent > 0 && (
          <p className="text-sm text-gray-600">Interés de cada mes: <b className="text-emerald-600">{money(Math.round(amount * percent / 100))}</b></p>
        )}
        <div>
          <label className={labelClass} htmlFor="loan-notes">Notas</label>
          <input id="loan-notes" value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} placeholder="Opcional" />
        </div>
        {loan && (
          <div>
            <label className={labelClass} htmlFor="loan-paidoff">Capital devuelto el</label>
            <input id="loan-paidoff" type="date" value={paidOff} onChange={e => setPaidOff(e.target.value)} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">Pon la fecha cuando te devuelvan el capital: el préstamo queda saldado y deja de causar intereses.</p>
          </div>
        )}
        {error && <p role="alert" className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" /> {error}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className={primaryButton}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} {loan ? 'Guardar cambios' : 'Registrar préstamo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function LoanDetailModal({ loan, onClose, onEdit, onChanged }: {
  loan: Loan; onClose: () => void; onEdit: () => void; onChanged: (loan: Loan | null, message?: string) => void;
}) {
  const [amount, setAmount] = useState(loan.interestPending > 0 ? String(loan.monthlyInterest) : '');
  const [date, setDate] = useState(todayInColombia());
  const [method, setMethod] = useState<PaymentMethod>('Nequi');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ kind: 'loan' } | { kind: 'payment'; payment: LoanInterestPayment } | null>(null);

  const addPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseMoney(amount);
    if (value <= 0) { setError('Indica el valor recaudado.'); return; }
    setBusy(true);
    setError('');
    try {
      const updated = await carteraApi.addLoanPayment(loan.id, { amount: value, paymentDate: date, method, notes: null });
      setAmount('');
      onChanged(updated, `Recaudo de ${money(value)} registrado.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el recaudo.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async (code: string) => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'loan') {
      await carteraApi.deleteLoan(loan.id, code);
      setPendingDelete(null);
      onChanged(null, 'Préstamo eliminado.');
    } else {
      await carteraApi.deleteLoanPayment(loan.id, pendingDelete.payment.id, code);
      setPendingDelete(null);
      onChanged({ ...loan, payments: loan.payments.filter(p => p.id !== pendingDelete.payment.id) }, 'Recaudo eliminado.');
    }
  };

  return (
    <Modal title={`Préstamo a ${loan.borrowerName}`} onClose={onClose} busy={busy} wide>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <LoanStatusBadge status={loan.status} />
          {loan.notes && <span className="text-xs text-gray-500">{loan.notes}</span>}
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><dt className={labelClass}>Prestado</dt><dd className="font-semibold">{money(loan.principal)}</dd><dd className="text-xs text-gray-400">{formatDay(loan.loanDate)}</dd></div>
          <div><dt className={labelClass}>Interés</dt><dd>{loan.monthlyRatePercent.toLocaleString('es-CO')} % mensual</dd><dd className="text-xs text-gray-400">{money(loan.monthlyInterest)} cada día {loan.collectionDay}</dd></div>
          <div><dt className={labelClass}>Recaudado</dt><dd className="text-emerald-600 font-semibold">{money(loan.interestCollected)}</dd><dd className="text-xs text-gray-400">de {money(loan.interestDue)} causado</dd></div>
          <div><dt className={labelClass}>Pendiente</dt><dd className={`font-extrabold ${loan.interestPending > 0 ? 'text-red-600' : ''}`}>{money(loan.interestPending)}</dd>
            <dd className="text-xs text-gray-400">{loan.paidOffDate ? `Saldado el ${formatDay(loan.paidOffDate)}` : `Próximo cobro: ${formatDay(loan.nextCollectionDate)}`}</dd></div>
        </dl>

        <section>
          <h3 className="text-sm font-extrabold text-black mb-2">Recaudos de interés</h3>
          {loan.payments.length === 0 ? <p className="text-sm text-gray-400">Sin recaudos.</p> : (
            <ul className="divide-y divide-gray-100 border border-gray-100 rounded-sm">
              {loan.payments.map(p => (
                <li key={p.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <span className="w-28 text-gray-500">{formatDay(p.paymentDate)}</span>
                  <span className="font-semibold w-28">{money(p.amount)}</span>
                  <span className="flex-1 text-xs text-gray-500">{p.method}</span>
                  <button onClick={() => setPendingDelete({ kind: 'payment', payment: p })} disabled={busy} aria-label="Eliminar recaudo"
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-sm hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form onSubmit={addPayment} noValidate className="border border-gray-100 rounded-sm p-4 space-y-3 bg-gray-50/50">
          <h3 className="text-sm font-extrabold text-black">Registrar recaudo de interés</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass} htmlFor="lp-amount">Valor</label>
              <input id="lp-amount" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} className={inputClass} placeholder={String(loan.monthlyInterest)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="lp-date">Fecha</label>
              <input id="lp-date" type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="lp-method">Medio</label>
              <select id="lp-method" value={method} onChange={e => setMethod(e.target.value as PaymentMethod)} className={inputClass}>
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={busy} className={primaryButton}>{busy && <Loader2 className="w-4 h-4 animate-spin" />} Registrar recaudo</button>
          </div>
        </form>

        {error && <p role="alert" className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" /> {error}</p>}

        <div className="flex justify-between pt-2 border-t border-gray-100">
          <button onClick={() => setPendingDelete({ kind: 'loan' })} disabled={busy} className={`${secondaryButton} text-red-600 hover:bg-red-50`}>
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </button>
          <button onClick={onEdit} disabled={busy} className={secondaryButton}><Edit className="w-3.5 h-3.5" /> Editar préstamo</button>
        </div>
      </div>

      {pendingDelete && (
        <VerifyDeleteModal
          title={pendingDelete.kind === 'loan' ? 'Eliminar préstamo' : 'Eliminar recaudo'}
          description={pendingDelete.kind === 'loan'
            ? `Se eliminará el préstamo de ${money(loan.principal)} a ${loan.borrowerName} con todos sus recaudos.`
            : `Se eliminará el recaudo de ${money(pendingDelete.payment.amount)} del ${formatDay(pendingDelete.payment.paymentDate)}.`}
          onConfirm={confirmDelete}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </Modal>
  );
}

export default function LoansPanel({ loans, onChanged }: Props) {
  const [form, setForm] = useState<Loan | null | undefined>(undefined);   // undefined = cerrado
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = loans.find(l => l.id === detailId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setForm(null)} className={primaryButton}><Plus className="w-4 h-4" /> Nuevo préstamo</button>
      </div>

      <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-x-auto">
        {loans.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <HandCoins className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Aún no hay préstamos registrados.</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[860px]">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-2.5 text-left">Persona</th>
                <th className="px-4 py-2.5 text-right">Prestado</th>
                <th className="px-4 py-2.5 text-left">Interés</th>
                <th className="px-4 py-2.5 text-right">Recaudado</th>
                <th className="px-4 py-2.5 text-right">Pendiente</th>
                <th className="px-4 py-2.5 text-left">Estado</th>
                <th className="px-4 py-2.5 text-left">Próximo cobro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.map(l => (
                <tr key={l.id} onClick={() => setDetailId(l.id)} className={`cursor-pointer hover:bg-gray-50 ${l.status === 'Saldado' ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-2.5"><p className="font-semibold">{l.borrowerName}</p><p className="text-xs text-gray-400">desde {formatDay(l.loanDate)}</p></td>
                  <td className="px-4 py-2.5 text-right font-semibold">{money(l.principal)}</td>
                  <td className="px-4 py-2.5"><p>{l.monthlyRatePercent.toLocaleString('es-CO')} % · {money(l.monthlyInterest)}</p><p className="text-xs text-gray-400">cada día {l.collectionDay}</p></td>
                  <td className="px-4 py-2.5 text-right text-emerald-600">{money(l.interestCollected)}</td>
                  <td className={`px-4 py-2.5 text-right font-bold ${l.interestPending > 0 ? 'text-red-600' : 'text-gray-300'}`}>{money(l.interestPending)}</td>
                  <td className="px-4 py-2.5"><LoanStatusBadge status={l.status} /></td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{formatDay(l.nextCollectionDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {form !== undefined && (
        <LoanFormModal loan={form} onClose={() => setForm(undefined)}
          onSaved={() => { setForm(undefined); onChanged(form ? 'Préstamo guardado.' : 'Préstamo registrado.'); }} />
      )}
      {detail && (
        <LoanDetailModal loan={detail}
          onClose={() => setDetailId(null)}
          onEdit={() => { setDetailId(null); setForm(detail); }}
          onChanged={(updated, message) => { if (!updated) setDetailId(null); onChanged(message); }} />
      )}
    </div>
  );
}
