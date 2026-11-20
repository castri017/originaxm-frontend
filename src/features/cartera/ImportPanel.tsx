import { useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2, Upload } from 'lucide-react';
import { carteraApi } from './api';
import { parseCarteraSheet, type Cell, type DraftRow } from './excelImport';
import { formatDay, money } from './format';
import { bestMatch, rankProducts } from './productMatch';
import { inputClass, parseMoney, primaryButton, SALE_TYPE_LABEL, secondaryButton } from './styles';
import type { CatalogProductOption, ImportRow } from './types';

interface Props {
  products: CatalogProductOption[];
  existingSales: number;
  onImported: (message: string) => void;
}

interface ReviewRow extends DraftRow {
  include: boolean;
  suggestions: { id: string; name: string; score: number }[];
}

const FREE_TEXT = '';

/** Elige la hoja de ventas: la que se llame "Ventas" o, si no, la primera que tenga encabezados reconocibles. */
async function readWorkbook(file: File): Promise<{ sheet: string; data: Cell[][] }[]> {
  const { default: readXlsxFile } = await import('read-excel-file/browser');
  return (await readXlsxFile(file)) as { sheet: string; data: Cell[][] }[];
}

export default function ImportPanel({ products, existingSales, onImported }: Props) {
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [sheetName, setSheetName] = useState('');
  const [reading, setReading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [missing, setMissing] = useState<string[]>([]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setReading(true);
    setError('');
    setRows([]);
    setFileName(file.name);
    try {
      const sheets = await readWorkbook(file);
      const parsed = sheets
        .sort((a, b) => Number(b.sheet.toLowerCase() === 'ventas') - Number(a.sheet.toLowerCase() === 'ventas'))
        .map(s => {
          try { return { name: s.sheet, result: parseCarteraSheet(s.data) }; } catch { return null; }
        })
        .find(p => p && p.result.rows.length > 0);
      if (!parsed) throw new Error('No encontré una hoja con ventas. Debe tener las columnas "Producto", "Valor venta" y "Valor compra".');

      setSheetName(parsed.name);
      setMissing(parsed.result.missingColumns);
      setRows(parsed.result.rows.map(r => {
        const match = bestMatch(r.sourceProduct, products);
        return {
          ...r,
          include: true,
          productId: match?.product.id ?? null,
          suggestions: rankProducts(r.sourceProduct, products, 6).map(m => ({ id: m.product.id, name: m.product.name, score: m.score })),
        };
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo leer el archivo.');
    } finally {
      setReading(false);
    }
  };

  const update = (index: number, patch: Partial<ReviewRow>) =>
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const included = rows.filter(r => r.include);
  const summary = useMemo(() => {
    const sold = included.filter(r => r.customerName && r.type !== 'Devolucion');
    return {
      sold: sold.length,
      unsold: included.filter(r => !r.customerName && r.type !== 'Devolucion').length,
      returns: included.filter(r => r.type === 'Devolucion').length,
      matched: included.filter(r => r.productId).length,
      balance: sold.reduce((sum, r) => sum + Math.max(0, r.sellingPrice - r.amountPaid), 0),
      warnings: included.filter(r => r.warnings.length > 0).length,
    };
  }, [included]);

  const handleImport = async () => {
    if (included.length === 0) return;
    const extra = existingSales > 0
      ? `\n\nYa hay ${existingSales} ventas registradas: estas filas se suman a ellas (no las reemplazan). Si este Excel ya se importó, quedarían repetidas.`
      : '';
    if (!confirm(`¿Importar ${included.length} filas?${extra}`)) return;

    setImporting(true);
    setError('');
    try {
      const payload: ImportRow[] = included.map(r => ({
        productId: r.productId,
        productName: r.productId ? null : r.productName,
        customerName: r.customerName,
        purchasePrice: r.purchasePrice,
        sellingPrice: r.sellingPrice,
        purchaseDate: r.purchaseDate,
        saleDate: r.saleDate,
        type: r.type,
        collectionMethod: r.collectionMethod,
        amountPaid: r.customerName && r.type !== 'Devolucion' ? r.amountPaid : 0,
        // Si se relacionó con el catálogo, se guarda la descripción del Excel para no perder el color o el detalle.
        notes: [r.productId ? `Excel: ${r.sourceProduct}` : '', r.notes ?? ''].filter(Boolean).join(' · ') || null,
      }));
      const result = await carteraApi.importRows(payload);
      setRows([]);
      setFileName('');
      onImported(`Importadas ${result.created} filas: ${result.sold} vendidas (cartera ${money(result.totalBalance)}), ${result.unsold} sin vender y ${result.returns} devoluciones.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo importar.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-100 rounded-sm p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-black">Importar ventas desde Excel</h3>
        <ul className="text-xs text-gray-500 list-disc pl-5 space-y-1">
          <li>Se lee la hoja <b>Ventas</b> (o la primera con columnas Producto, Valor venta y Valor compra).</li>
          <li>Cliente vacío = termo <b>sin vender</b>. Cliente "Devolución" = <b>devolución</b> (venta y ganancia en 0).</li>
          <li>Valor compra en 0 = <b>bono</b> de Amazon. "Sistecrédito" en saldo o abonado = lo paga <b>Sistecrédito</b> a 60 días.</li>
          <li>Lo abonado entra como un abono "Otro" en la fecha de la venta (o de la compra), así no cambia la cuenta Nequi.</li>
        </ul>
        <label className={`${secondaryButton} w-fit cursor-pointer`}>
          {reading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {fileName ? 'Elegir otro archivo' : 'Elegir archivo .xlsx'}
          <input type="file" accept=".xlsx" className="sr-only" onChange={e => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
        {fileName && !reading && rows.length > 0 && (
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <FileSpreadsheet className="w-4 h-4" /> {fileName} · hoja "{sheetName}" · {rows.length} filas
            {missing.length > 0 && <span className="text-amber-600">· sin columnas: {missing.join(', ')}</span>}
          </p>
        )}
        {error && <p role="alert" className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" /> {error}</p>}
      </div>

      {rows.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
            {[
              ['Vendidas', String(summary.sold)],
              ['Sin vender', String(summary.unsold)],
              ['Devoluciones', String(summary.returns)],
              ['Productos relacionados', `${summary.matched} de ${included.length}`],
              ['Cartera', money(summary.balance)],
            ].map(([label, value]) => (
              <div key={label} className="bg-white border border-gray-100 rounded-sm p-3 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-lg font-extrabold">{value}</p>
              </div>
            ))}
          </div>

          {summary.warnings > 0 && (
            <p className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-sm px-4 py-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {summary.warnings} fila{summary.warnings !== 1 ? 's' : ''} con avisos: revísalas (resaltadas en amarillo).
            </p>
          )}

          <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left w-8"><span className="sr-only">Incluir</span></th>
                  <th className="px-3 py-2 text-left">Fila</th>
                  <th className="px-3 py-2 text-left">Producto en el Excel → producto del catálogo</th>
                  <th className="px-3 py-2 text-left">Cliente</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-right">Compra</th>
                  <th className="px-3 py-2 text-right">Venta</th>
                  <th className="px-3 py-2 text-right">Abonado</th>
                  <th className="px-3 py-2 text-left">Compra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r, i) => (
                  <tr key={r.excelRow} className={`${!r.include ? 'opacity-40' : r.warnings.length ? 'bg-amber-50/60' : ''} align-top`}>
                    <td className="px-3 py-2">
                      <input type="checkbox" checked={r.include} onChange={e => update(i, { include: e.target.checked })}
                        aria-label={`Incluir fila ${r.excelRow}`} className="w-4 h-4 accent-black mt-1" />
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-400">{r.excelRow}</td>
                    <td className="px-3 py-2 max-w-[26rem]">
                      <p className="text-xs text-gray-500 line-clamp-2" title={r.sourceProduct}>{r.sourceProduct}</p>
                      <select value={r.productId ?? FREE_TEXT} onChange={e => update(i, { productId: e.target.value || null })}
                        className={`${inputClass} mt-1 py-1.5 text-xs ${r.productId ? 'border-emerald-200' : ''}`}>
                        <option value={FREE_TEXT}>— Sin relacionar (guardar el texto del Excel)</option>
                        {r.suggestions.length > 0 && (
                          <optgroup label="Más parecidos">
                            {r.suggestions.map(s => <option key={s.id} value={s.id}>{s.name} ({Math.round(s.score * 100)}%)</option>)}
                          </optgroup>
                        )}
                        <optgroup label="Todo el catálogo">
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </optgroup>
                      </select>
                      {r.warnings.map(w => <p key={w} className="text-xs text-amber-700 mt-1">⚠ {w}</p>)}
                    </td>
                    <td className="px-3 py-2">
                      {r.customerName ?? <span className="text-xs text-amber-700">Sin vender</span>}
                      {r.collectionMethod === 'Sistecredito' && <p className="text-xs text-gray-500">Sistecrédito</p>}
                    </td>
                    <td className="px-3 py-2 text-xs">{SALE_TYPE_LABEL[r.type]}</td>
                    <td className="px-3 py-2 text-right">{money(r.purchasePrice)}</td>
                    <td className="px-3 py-2 text-right">{money(r.sellingPrice)}</td>
                    <td className="px-3 py-2 text-right">
                      {r.customerName && r.type !== 'Devolucion' && r.collectionMethod === 'Abonos' ? (
                        <input inputMode="numeric" value={r.amountPaid} aria-label={`Abonado fila ${r.excelRow}`}
                          onChange={e => update(i, { amountPaid: Math.min(parseMoney(e.target.value), r.sellingPrice) })}
                          className={`${inputClass} py-1.5 text-xs text-right w-28 ml-auto`} />
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{formatDay(r.purchaseDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button onClick={handleImport} disabled={importing || included.length === 0} className={primaryButton}>
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Importar {included.length} filas
            </button>
          </div>
        </>
      )}
    </div>
  );
}
