import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { carteraApi } from './api';
import { dayOf, formatDay, money } from './format';
import { inputClass, labelClass, parseMoney, primaryButton } from './styles';
import type { CashAccount } from './types';

interface Props {
  account: CashAccount | null;
  onSaved: (account: CashAccount) => void;
}

/**
 * Cuenta Nequi: desde la fecha de corte, resta cada compra en Amazon más su 4×1000 y suma los abonos
 * que entraron por Nequi. Lo anterior a la fecha de corte ya está en el saldo inicial.
 */
export default function NequiPanel({ account, onSaved }: Props) {
  const [initial, setInitial] = useState(account ? String(account.initialBalance) : '');
  const [startDate, setStartDate] = useState(dayOf(account?.startDate) ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!account) {
    return <div className="flex items-center justify-center py-16 text-gray-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando cuenta Nequi...</div>;
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) { setError('Indica la fecha de corte.'); return; }
    setSaving(true);
    setError('');
    try {
      onSaved(await carteraApi.updateNequi(parseMoney(initial), startDate));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  const rows: [string, number, string][] = [
    ['Saldo inicial', account.initialBalance, ''],
    ['Compras en Amazon', -account.purchasesOut, 'text-red-600'],
    [`4×1000 (${(account.gmfRate * 1000).toLocaleString('es-CO')} por mil)`, -account.gmfOut, 'text-red-600'],
    ['Abonos recibidos por Nequi', account.paymentsIn, 'text-emerald-600'],
    ['Intereses de préstamos por Nequi', account.interestIn ?? 0, 'text-emerald-600'],
  ];

  return (
    <div className="grid lg:grid-cols-[22rem_1fr] gap-6">
      <div className="space-y-4">
        <form onSubmit={save} noValidate className="bg-white border border-gray-100 rounded-sm p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-extrabold text-black">Punto de partida</h3>
          <div>
            <label className={labelClass} htmlFor="nequi-initial">Saldo inicial en Nequi</label>
            <input id="nequi-initial" inputMode="numeric" value={initial} onChange={e => setInitial(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="nequi-start">Fecha de corte</label>
            <input id="nequi-start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">El día en que Nequi tenía ese saldo. Solo cuentan las compras y abonos desde ese día.</p>
          </div>
          {error && <p role="alert" className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" /> {error}</p>}
          <button type="submit" disabled={saving} className={`${primaryButton} w-full`}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
          </button>
        </form>

        <div className="bg-white border border-gray-100 rounded-sm p-5 shadow-sm">
          <dl className="space-y-2 text-sm">
            {rows.map(([label, value, color]) => (
              <div key={label} className="flex justify-between gap-3">
                <dt className="text-gray-600">{label}</dt>
                <dd className={`font-semibold ${color}`}>{money(value)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-3 pt-2 border-t border-gray-100">
              <dt className="font-extrabold text-black">Saldo esperado</dt>
              <dd className="font-extrabold text-black text-lg">{money(account.expectedBalance)}</dd>
            </div>
          </dl>
          <p className="text-xs text-gray-400 mt-3">Compáralo con el saldo real de la app de Nequi. Si no cuadra, falta registrar un abono, un recaudo de interés o una compra.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-sm shadow-sm">
        <h3 className="text-sm font-extrabold text-black px-5 pt-5 pb-3">Movimientos desde {formatDay(account.startDate)}</h3>
        {account.movements.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-gray-400">Aún no hay movimientos desde la fecha de corte.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {account.movements.map((m, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                <span className="w-24 text-xs text-gray-500">{formatDay(m.date)}</span>
                <span className="w-16 text-xs font-bold text-gray-500 uppercase">{m.kind === 'Interes' ? 'Interés' : m.kind}</span>
                <span className="flex-1 truncate text-gray-700">{m.description}</span>
                <span className={`font-semibold ${m.amount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{money(m.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
