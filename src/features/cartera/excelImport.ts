import type { CollectionMethod, ImportRow, SaleType } from './types';

/**
 * Lee la hoja de ventas del Excel de cartera y la convierte en filas para revisar antes de importar.
 * Reglas del negocio (las dio el dueño de la tienda):
 *  - Cliente vacío: el termo aún no se vende (inventario).
 *  - Cliente "Devolución": es una devolución; venta y ganancia en 0, a la espera del bono de Amazon.
 *  - Valor de compra en 0: se compró con un bono de Amazon.
 *  - "Sistecrédito" en el saldo o en lo abonado: la paga Sistecrédito, que desembolsa a 60 días.
 */

export type Cell = string | number | boolean | Date | null | undefined;

export interface DraftRow extends ImportRow {
  /** Número de fila en el Excel, para ubicarla. */
  excelRow: number;
  /** Descripción del producto tal como viene en el Excel. */
  sourceProduct: string;
  /** Avisos para revisar a mano antes de importar. */
  warnings: string[];
}

export interface ParsedSheet {
  rows: DraftRow[];
  /** Columnas que no se encontraron y se dieron por vacías. */
  missingColumns: string[];
}

const COLUMNS = {
  saleDate:      ['fecha venta', 'fecha de venta'],
  customer:      ['cliente'],
  product:       ['producto', 'descripcion', 'descripción'],
  type:          ['tipo'],
  selling:       ['valor venta', 'precio venta', 'precio de venta', 'venta'],
  balance:       ['saldo pendiente', 'saldo'],
  purchase:      ['valor compra', 'precio compra', 'precio de compra', 'compra'],
  paid:          ['abonado', 'abono', 'abonos'],
  purchaseDate:  ['fecha compra', 'fecha de compra'],
  notes:         ['notas', 'nota', 'observaciones'],
} as const;

type ColumnKey = keyof typeof COLUMNS;
const REQUIRED: ColumnKey[] = ['product', 'selling', 'purchase'];

const normalize = (value: Cell) =>
  String(value ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

/** Ubica cada columna por su encabezado, aceptando variantes ("Valor compra (Amazon)", "Fecha de venta"...). */
function mapHeader(header: Cell[]): Partial<Record<ColumnKey, number>> {
  const names = header.map(normalize);
  const result: Partial<Record<ColumnKey, number>> = {};
  const taken = new Set<number>();
  // Primero las variantes más largas, para que "valor venta" no se quede con "fecha venta".
  const entries = (Object.entries(COLUMNS) as [ColumnKey, readonly string[]][])
    .flatMap(([key, aliases]) => aliases.map(alias => ({ key, alias: normalize(alias) })))
    .sort((a, b) => b.alias.length - a.alias.length);

  for (const { key, alias } of entries) {
    if (result[key] !== undefined) continue;
    const index = names.findIndex((n, i) => !taken.has(i) && (n === alias || n.startsWith(alias + ' ') || n.startsWith(alias + '(')));
    if (index >= 0) { result[key] = index; taken.add(index); }
  }
  return result;
}

/** Encuentra la fila de encabezados: la primera que nombra el producto y el valor de venta. */
export function findHeaderRow(rows: Cell[][]): number {
  return rows.findIndex(r => {
    const map = mapHeader(r);
    return map.product !== undefined && map.selling !== undefined;
  });
}

const toNumber = (value: Cell): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const clean = value.replace(/[$\s]/g, '').replace(/\./g, '').replace(',', '.');
    if (clean === '' || !/^-?\d+(\.\d+)?$/.test(clean)) return null;
    return Number(clean);
  }
  return null;
};

const isSistecredito = (value: Cell) => normalize(value).includes('sistecredito');

/** Fecha del Excel como "YYYY-MM-DD". Los Date de Excel llegan a medianoche UTC. */
export function toIsoDay(value: Cell): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string') {
    const t = value.trim();
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(t);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(t);   // en Colombia el día va primero
    if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }
  return null;
}

const parseType = (value: Cell): SaleType | null => {
  const t = normalize(value);
  if (t.startsWith('devol')) return 'Devolucion';
  if (t === 'bono') return 'Bono';
  if (t === 'normal') return 'Normal';
  return null;
};

export function parseCarteraSheet(rows: Cell[][]): ParsedSheet {
  const headerIndex = findHeaderRow(rows);
  if (headerIndex < 0) {
    throw new Error('No encontré la fila de encabezados. La hoja debe tener al menos las columnas "Producto", "Valor venta" y "Valor compra".');
  }

  const map = mapHeader(rows[headerIndex]);
  const missingRequired = REQUIRED.filter(k => map[k] === undefined);
  if (missingRequired.length) {
    throw new Error(`Faltan columnas obligatorias: ${missingRequired.map(k => COLUMNS[k][0]).join(', ')}.`);
  }
  const missingColumns = (Object.keys(COLUMNS) as ColumnKey[])
    .filter(k => map[k] === undefined)
    .map(k => COLUMNS[k][0]);

  const get = (row: Cell[], key: ColumnKey): Cell => (map[key] === undefined ? null : row[map[key]!]);
  const result: DraftRow[] = [];

  rows.slice(headerIndex + 1).forEach((row, i) => {
    const excelRow = headerIndex + i + 2;
    const sourceProduct = String(get(row, 'product') ?? '').replace(/\s+/g, ' ').trim();
    const selling  = toNumber(get(row, 'selling'));
    const purchase = toNumber(get(row, 'purchase'));
    if (!sourceProduct && selling === null && purchase === null) return;   // fila vacía

    const warnings: string[] = [];
    const rawCustomer = String(get(row, 'customer') ?? '').replace(/\s+/g, ' ').trim();
    const customerIsReturn = normalize(rawCustomer).startsWith('devolucion');

    let type: SaleType = parseType(get(row, 'type'))
      ?? (customerIsReturn ? 'Devolucion' : purchase === 0 ? 'Bono' : 'Normal');
    if (customerIsReturn) type = 'Devolucion';

    const sistecredito = isSistecredito(get(row, 'balance')) || isSistecredito(get(row, 'paid'));
    const collectionMethod: CollectionMethod = sistecredito ? 'Sistecredito' : 'Abonos';
    const customerName = customerIsReturn ? '' : rawCustomer;

    // Lo abonado: se toma la columna "Abonado"; si no cuadra con el saldo, se avisa para revisarlo.
    const sellingPrice = selling ?? 0;
    const paidCell    = toNumber(get(row, 'paid'));
    const balanceCell = toNumber(get(row, 'balance'));
    let amountPaid = 0;
    if (type !== 'Devolucion' && customerName && !sistecredito) {
      if (paidCell !== null) amountPaid = paidCell;
      else if (balanceCell !== null) amountPaid = Math.max(0, sellingPrice - balanceCell);

      if (paidCell !== null && balanceCell !== null && sellingPrice - paidCell !== balanceCell) {
        warnings.push(`Lo abonado ($${paidCell.toLocaleString('es-CO')}) y el saldo ($${balanceCell.toLocaleString('es-CO')}) no cuadran con la venta ($${sellingPrice.toLocaleString('es-CO')}). Corrige lo abonado si hace falta.`);
      }
    }
    if (amountPaid > sellingPrice) {
      warnings.push('Lo abonado supera el valor de venta; se dejó igual a la venta.');
      amountPaid = sellingPrice;
    }
    if (!customerName && type !== 'Devolucion' && paidCell) {
      warnings.push('Tiene abonos pero no tiene cliente: se importa sin vender y sin abonos.');
    }
    if (selling === null) warnings.push('Sin valor de venta.');
    if (purchase === null) warnings.push('Sin valor de compra.');

    const purchaseDate = toIsoDay(get(row, 'purchaseDate'));
    if (!purchaseDate) warnings.push('Sin fecha de compra: se usará la fecha de hoy.');

    const notes = String(get(row, 'notes') ?? '').trim();

    result.push({
      excelRow,
      sourceProduct,
      warnings,
      productId: null,
      productName: sourceProduct,
      customerName: customerName || null,
      purchasePrice: type === 'Bono' ? 0 : purchase ?? 0,
      sellingPrice: type === 'Devolucion' ? 0 : sellingPrice,
      purchaseDate,
      saleDate: customerName ? toIsoDay(get(row, 'saleDate')) : null,
      type,
      collectionMethod,
      amountPaid,
      notes: [notes, customerIsReturn && rawCustomer ? `Importado como devolución (cliente en el Excel: "${rawCustomer}")` : '']
        .filter(Boolean).join(' · ') || null,
    });
  });

  return { rows: result, missingColumns };
}
