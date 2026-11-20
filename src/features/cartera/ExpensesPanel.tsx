import { useMemo, useState } from 'react';
import { AlertCircle, Edit, Loader2, Plus, Receipt, Trash2, X } from 'lucide-react';
import { carteraApi } from './api';
import { dayOf, formatDay, money, todayInColombia } from './format';
import { inputClass, labelClass, parseMoney, primaryButton } from './styles';
import VerifyDeleteModal from './VerifyDeleteModal';
import type { CreditExpense } from './types';

interface Props {
  expenses: CreditExpense[];
  onChanged: (message?: string) => void;
}

/** Gastos de la cartera: descripción, valor y fecha, con su total. */
export default function ExpensesPanel({ expenses, onChanged }: Props) {
  const [editing, setEditing] = useState<CreditExpense | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayInColombia());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<CreditExpense | null>(null);
  const [month, setMonth] = useState('');   // "YYYY-MM" o vacío = todos

  const months = useMemo(() => [...new Set(expenses.map(e => (dayOf(e.date) ?? '').slice(0, 7)))].filter(Boolean).sort().reverse(), [expenses]);
  const visible = expenses.filter(e => !month || (dayOf(e.date) ?? '').startsWith(month));
  const total = visible.reduce((sum, e) => sum + e.amount, 0);

  const reset = () => { setEditing(null); setDescription(''); setAmount(''); setDate(todayInColombia()); setError(''); };

  const startEdit = (e: CreditExpense) => {
    setEditing(e); setDescription(e.description); setAmount(String(e.amount)); setDate(dayOf(e.date) ?? todayInColombia()); setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseMoney(amount);
    if (!description.trim()) { setError('Escribe la descripción del gasto.'); return; }
    if (value <= 0) { setError('Indica el valor del gasto.'); return; }
    setSaving(true);
    setError('');
    try {
      const input = { description: description.trim(), amount: value, date };
      if (editing) await carteraApi.updateExpense(editing.id, input);
      else await carteraApi.createExpense(input);
      const message = editing ? 'Gasto guardado.' : `Gasto de ${money(value)} registrado.`;
      reset();
      onChanged(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el gasto.');
    } finally {
      setSaving(false);
    }
  };

  const monthLabel = (m: string) => {
    const [y, mo] = m.split('-').map(Number);
    return new Date(y, mo - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="grid lg:grid-cols-[22rem_1fr] gap-6">
      <form onSubmit={handleSubmit} noValidate className="bg-white border border-gray-100 rounded-sm p-5 space-y-4 shadow-sm h-fit">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-black">{editing ? 'Editar gasto' : 'Nuevo gasto'}</h3>
          {editing && <button type="button" onClick={reset} aria-label="Cancelar edición" className="p-1 text-gray-400 hover:text-black"><X className="w-4 h-4" /></button>}
        </div>
        <div>
          <label className={labelClass} htmlFor="exp-desc">Descripción</label>
          <input id="exp-desc" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} placeholder="Ej. envío Interrapidísimo" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="exp-amount">Valor</label>
            <input id="exp-amount" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="exp-date">Fecha</label>
            <input id="exp-date" type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
          </div>
        </div>
        {error && <p role="alert" className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" /> {error}</p>}
        <button type="submit" disabled={saving} className={`${primaryButton} w-full`}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {editing ? 'Guardar cambios' : 'Registrar gasto'}
        </button>
      </form>

      <div className="bg-white border border-gray-100 rounded-sm shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-3">
          <h3 className="text-sm font-extrabold text-black">Gastos</h3>
          {months.length > 0 && (
            <select value={month} onChange={e => setMonth(e.target.value)} aria-label="Filtrar por mes" className={`${inputClass.replace('w-full', 'w-auto')} py-1.5 text-xs`}>
              <option value="">Todos los meses</option>
              {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
          )}
        </div>
        {visible.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Aún no hay gastos registrados.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {visible.map(e => (
                <tr key={e.id} className={editing?.id === e.id ? 'bg-amber-50/60' : ''}>
                  <td className="px-5 py-2.5 w-28 text-xs text-gray-500 whitespace-nowrap">{formatDay(e.date)}</td>
                  <td className="px-2 py-2.5">{e.description}</td>
                  <td className="px-2 py-2.5 text-right font-semibold whitespace-nowrap">{money(e.amount)}</td>
                  <td className="px-3 py-2.5 w-20">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => startEdit(e)} aria-label={`Editar ${e.description}`} className="p-1.5 text-gray-400 hover:text-black rounded-sm hover:bg-gray-100"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleting(e)} aria-label={`Eliminar ${e.description}`} className="p-1.5 text-gray-400 hover:text-red-600 rounded-sm hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-5 py-3 font-bold" colSpan={2}>Total{month ? ` de ${monthLabel(month)}` : ''} · {visible.length} gasto{visible.length !== 1 ? 's' : ''}</td>
                <td className="px-2 py-3 text-right font-extrabold text-red-600 whitespace-nowrap">{money(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {deleting && (
        <VerifyDeleteModal
          title="Eliminar gasto"
          description={`Se eliminará "${deleting.description}" por ${money(deleting.amount)} del ${formatDay(deleting.date)}.`}
          onConfirm={async code => {
            await carteraApi.deleteExpense(deleting.id, code);
            setDeleting(null);
            if (editing?.id === deleting.id) reset();
            onChanged('Gasto eliminado.');
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
