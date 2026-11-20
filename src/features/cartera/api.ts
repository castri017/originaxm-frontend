import { API } from '../../config/api';
import { adminFetch } from '../../lib/adminFetch';
import type {
  CashAccount, CatalogProductOption, CreditCustomer, CreditSale, CreditSaleDetail, CreditStats,
  ImportResult, ImportRow, PaymentInput, PaymentMethod, RegisteredCustomer, SaleInput,
} from './types';

const BASE = `${API}/api/creditsales`;

async function readError(res: Response, fallback: string): Promise<Error> {
  const body = await res.json().catch(() => ({}));
  return new Error(body.message ?? body.title ?? fallback);
}

async function getJson<T>(url: string, fallback: string): Promise<T> {
  const res = await adminFetch(url);
  if (!res.ok) throw await readError(res, fallback);
  return res.json();
}

async function sendJson<T>(url: string, method: string, body: unknown, fallback: string): Promise<T> {
  const res = await adminFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await readError(res, fallback);
  return res.status === 204 ? (undefined as T) : res.json();
}

export const carteraApi = {
  sales: () => getJson<CreditSale[]>(BASE, 'No se pudieron cargar las ventas.'),
  sale: (id: string) => getJson<CreditSaleDetail>(`${BASE}/${id}`, 'No se pudo cargar la venta.'),
  stats: () => getJson<CreditStats>(`${BASE}/summary`, 'No se pudo cargar el resumen.'),
  customers: () => getJson<CreditCustomer[]>(`${BASE}/customers`, 'No se pudo cargar la cartera por cliente.'),
  nequi: () => getJson<CashAccount>(`${BASE}/nequi`, 'No se pudo cargar la cuenta Nequi.'),

  createSale: (input: SaleInput) => sendJson<CreditSaleDetail>(BASE, 'POST', input, 'No se pudo registrar la venta.'),
  updateSale: (id: string, input: SaleInput) => sendJson<CreditSaleDetail>(`${BASE}/${id}`, 'PUT', input, 'No se pudo guardar la venta.'),
  deleteSale: (id: string) => sendJson<void>(`${BASE}/${id}`, 'DELETE', undefined, 'No se pudo eliminar la venta.'),

  addPayment: (saleId: string, input: PaymentInput) =>
    sendJson<CreditSaleDetail>(`${BASE}/${saleId}/payments`, 'POST', input, 'No se pudo registrar el abono.'),
  deletePayment: (saleId: string, paymentId: string) =>
    sendJson<void>(`${BASE}/${saleId}/payments/${paymentId}`, 'DELETE', undefined, 'No se pudo eliminar el abono.'),

  addCustomerPayment: (input: { customerId: string | null; customerName: string | null; amount: number; paymentDate: string; method: PaymentMethod; notes: string | null }) =>
    sendJson<{ applied: number; salesAffected: number }>(`${BASE}/customers/payments`, 'POST', input, 'No se pudo registrar el abono.'),

  updateNequi: (initialBalance: number, startDate: string) =>
    sendJson<CashAccount>(`${BASE}/nequi`, 'PUT', { initialBalance, startDate }, 'No se pudo guardar la cuenta Nequi.'),

  importRows: (rows: ImportRow[]) =>
    sendJson<ImportResult>(`${BASE}/import`, 'POST', { rows }, 'No se pudo importar el archivo.'),

  catalogProducts: () => getJson<CatalogProductOption[]>(`${API}/api/products`, 'No se pudieron cargar los productos.'),
  registeredCustomers: () => getJson<RegisteredCustomer[]>(`${API}/api/customers`, 'No se pudieron cargar los clientes.'),
};
