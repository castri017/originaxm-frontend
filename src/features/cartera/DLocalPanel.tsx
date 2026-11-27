import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { carteraApi } from './api';
import { dayOf, formatDay, money } from './format';
import { inputClass, labelClass, parseMoney, primaryButton } from './styles';
import type { GatewayAccount } from './types';

interface Props {
  account: GatewayAccount | null;
  onSaved: (account: GatewayAccount) => void;
}

/** "3,49" o "3.49" → 0.0349; vacío → 0; inválido → NaN. */
function parsePercent(value: string): number {
  const clean = value.trim().replace('%', '').replace(',', '.');
  if (!clean) return 0;
  const n = Number(clean);
  return Number.isFinite(n) ? n / 100 : NaN;
}

const asPercent = (fraction: number) => (fraction ? String(+(fraction * 100).toFixed(4)).replace('.', ',') : '');

/**
 * Cuenta dLocal Go: cada pedido de la tienda pagado en línea suma lo cobrado (productos + envío)
 * y resta la comisión de dLocal Go, calculada con el porcentaje, el valor fijo y el IVA de aquí.
 * La comisión se calcula al confirmarse cada pago: cambiarla no recalcula los pagos anteriores.
 */
export default function DLocalPanel({ account, onSaved }: Props) {
  const [initial, setInitial] = useState(account ? String(account.initialBalance) : '');
  const [startDate, setStartDate] = useState(dayOf(account?.startDate) ?? '');
  const [percent, setPercent] = useState(asPercent(account?.feePercent ?? 0));
  const [fixed, setFixed] = useState(account?.feeFixed ? String(account.feeFixed) : '');
  const [tax, setTax] = useState(asPercent(account?.feeTaxRate ?? 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!account) {
    return <div className="flex items-center justify-center py-16 text-gray-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando cuenta dLocal Go...</div>;
  }

  const feePercent = parsePercent(percent);
  const feeTaxRate = parsePercent(tax);
  const feeFixed = parseMoney(fixed);
  // Ejemplo con una venta de $100.000 para ver la comisión antes de guardar.
  const sampleFee = Number.isFinite(feePercent) && Number.isFinite(feeTaxRate)
    ? Math.round((100_000 * feePercent + feeFixed) * (1 + feeTaxRate))
    : null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) { setError('Indica la fecha de corte.'); return; }
    if (!Number.isFinite(feePercent) || feePercent < 0 || feePercent >= 1) { setError('El porcentaje de la comisión debe estar entre 0 y 100.'); return; }
    if (!Number.isFinite(feeTaxRate) || feeTaxRate < 0 || feeTaxRate >= 1) { setError('El IVA debe estar entre 0 y 100.'); return; }
    setSaving(true);
    setError('');
    try {
      onSaved(await carteraApi.updateDLocal({ initialBalance: parseMoney(initial), startDate, feePercent, feeFixed, feeTaxRate }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  const rows: [string, number, string][] = [
    ['Saldo inicial', account.initialBalance, ''],
    [`Cobrado en la tienda (${account.ordersCount} pedido${account.ordersCount !== 1 ? 's' : ''})`, account.chargedIn, 'text-emerald-600'],
    ['Comisiones de dLocal Go', -account.feesOut, 'text-red-600'],
  ];

  return (
    <div className="grid lg:grid-cols-[22rem_1fr] gap-6">
      <div className="space-y-4">
        <form onSubmit={save} noValidate className="bg-white border border-gray-100 rounded-sm p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-extrabold text-black">Comisión de dLocal Go</h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelClass} htmlFor="dl-percent">%</label>
              <input id="dl-percent" inputMode="decimal" placeholder="3,49" value={percent} onChange={e => setPercent(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="dl-fixed">Fijo $</label>
              <input id="dl-fixed" inputMode="numeric" placeholder="900" value={fixed} onChange={e => setFixed(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="dl-tax">IVA %</label>
              <input id="dl-tax" inputMode="decimal" placeholder="19" value={tax} onChange={e => setTax(e.target.value)} className={inputClass} />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Las tarifas están en tu panel de dLocal Go.
            {sampleFee !== null && <> Una venta de $100.000 dejaría <b className="text-gray-600">{money(sampleFee)}</b> de comisión.</>}
            {' '}Se aplica a los pagos que se confirmen desde que la guardes.
          </p>

          <h3 className="text-sm font-extrabold text-black pt-2">Punto de partida</h3>
          <div>
            <label className={labelClass} htmlFor="dl-initial">Saldo inicial en dLocal Go</label>
            <input id="dl-initial" inputMode="numeric" value={initial} onChange={e => setInitial(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="dl-start">Fecha de corte</label>
            <input id="dl-start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">Solo cuentan los pagos confirmados desde ese día. Cuando dLocal Go te transfiera a tu banco, actualiza el saldo y la fecha.</p>
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
          <p className="text-xs text-gray-400 mt-3">Compáralo con el saldo disponible en tu panel de dLocal Go.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-sm shadow-sm">
        <h3 className="text-sm font-extrabold text-black px-5 pt-5 pb-3">Movimientos desde {formatDay(account.startDate)}</h3>
        {account.movements.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-gray-400">Aún no hay pagos de la tienda desde la fecha de corte.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {account.movements.map((m, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                <span className="w-24 text-xs text-gray-500">{formatDay(m.date)}</span>
                <span className="w-20 text-xs font-bold text-gray-500 uppercase">{m.kind === 'Comision' ? 'Comisión' : m.kind}</span>
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
