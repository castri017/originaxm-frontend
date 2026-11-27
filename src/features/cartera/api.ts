import { API } from '../../config/api';
import { adminFetch } from '../../lib/adminFetch';
import type {
  CashAccount, CatalogProductOption, CreditCustomer, CreditExpense, CreditSale, CreditSaleDetail, CreditStats,
  ExpenseInput, GatewayAccount, ImportResult, ImportRow, Loan, LoanInput, LoansSummary, PaymentInput, PaymentMethod,
  RegisteredCustomer, SaleInput,
} from './types';

const BASE = `${API}/api/creditsales`;
const LOANS = `${API}/api/loans`;
const EXPENSES = `${API}/api/creditexpenses`;

async function readError(res: Response, fallback: string): Promise<Error> {
  const body = await res.json().catch(() => ({}));
  return new Error(body.message ?? body.title ?? fallback);
}

async function getJson<T>(url: string, fallback: string): Promise<T> {
  const res = await adminFetch(url);
  if (!res.ok) throw await readError(res, fallback);
  return res.json();
}

async function sendJson<T>(url: string, method: string, body: unknown, fallback: string, headers: Record<string, string> = {}): Promise<T> {
  const res = await adminFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
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
  dlocal: () => getJson<GatewayAccount>(`${BASE}/dlocal`, 'No se pudo cargar la cuenta dLocal Go.'),

  createSale: (input: SaleInput) => sendJson<CreditSaleDetail>(BASE, 'POST', input, 'No se pudo registrar la venta.'),
  updateSale: (id: string, input: SaleInput) => sendJson<CreditSaleDetail>(`${BASE}/${id}`, 'PUT', input, 'No se pudo guardar la venta.'),
  /** Eliminar exige el código de verificación del administrador; el servidor lo valida. */
  deleteSale: (id: string, code: string) =>
    sendJson<void>(`${BASE}/${id}`, 'DELETE', undefined, 'No se pudo eliminar la venta.', { 'X-Verification-Code': code }),

  addPayment: (saleId: string, input: PaymentInput) =>
    sendJson<CreditSaleDetail>(`${BASE}/${saleId}/payments`, 'POST', input, 'No se pudo registrar el abono.'),
  deletePayment: (saleId: string, paymentId: string, code: string) =>
    sendJson<void>(`${BASE}/${saleId}/payments/${paymentId}`, 'DELETE', undefined, 'No se pudo eliminar el abono.', { 'X-Verification-Code': code }),

  addCustomerPayment: (input: { customerId: string | null; customerName: string | null; amount: number; paymentDate: string; method: PaymentMethod; notes: string | null }) =>
    sendJson<{ applied: number; salesAffected: number }>(`${BASE}/customers/payments`, 'POST', input, 'No se pudo registrar el abono.'),

  updateNequi: (initialBalance: number, startDate: string) =>
    sendJson<CashAccount>(`${BASE}/nequi`, 'PUT', { initialBalance, startDate }, 'No se pudo guardar la cuenta Nequi.'),

  updateDLocal: (input: { initialBalance: number; startDate: string; feePercent: number; feeFixed: number; feeTaxRate: number }) =>
    sendJson<GatewayAccount>(`${BASE}/dlocal`, 'PUT', input, 'No se pudo guardar la cuenta dLocal Go.'),

  importRows: (rows: ImportRow[]) =>
    sendJson<ImportResult>(`${BASE}/import`, 'POST', { rows }, 'No se pudo importar el archivo.'),

  loans: () => getJson<Loan[]>(LOANS, 'No se pudieron cargar los préstamos.'),
  loansSummary: () => getJson<LoansSummary>(`${LOANS}/summary`, 'No se pudo cargar el resumen de préstamos.'),
  createLoan: (input: LoanInput) => sendJson<Loan>(LOANS, 'POST', input, 'No se pudo registrar el préstamo.'),
  updateLoan: (id: string, input: LoanInput) => sendJson<Loan>(`${LOANS}/${id}`, 'PUT', input, 'No se pudo guardar el préstamo.'),
  deleteLoan: (id: string, code: string) =>
    sendJson<void>(`${LOANS}/${id}`, 'DELETE', undefined, 'No se pudo eliminar el préstamo.', { 'X-Verification-Code': code }),
  addLoanPayment: (loanId: string, input: PaymentInput) =>
    sendJson<Loan>(`${LOANS}/${loanId}/payments`, 'POST', input, 'No se pudo registrar el recaudo.'),
  deleteLoanPayment: (loanId: string, paymentId: string, code: string) =>
    sendJson<void>(`${LOANS}/${loanId}/payments/${paymentId}`, 'DELETE', undefined, 'No se pudo eliminar el recaudo.', { 'X-Verification-Code': code }),

  expenses: () => getJson<CreditExpense[]>(EXPENSES, 'No se pudieron cargar los gastos.'),
  createExpense: (input: ExpenseInput) => sendJson<CreditExpense>(EXPENSES, 'POST', input, 'No se pudo registrar el gasto.'),
  updateExpense: (id: string, input: ExpenseInput) => sendJson<CreditExpense>(`${EXPENSES}/${id}`, 'PUT', input, 'No se pudo guardar el gasto.'),
  deleteExpense: (id: string, code: string) =>
    sendJson<void>(`${EXPENSES}/${id}`, 'DELETE', undefined, 'No se pudo eliminar el gasto.', { 'X-Verification-Code': code }),

  catalogProducts: () => getJson<CatalogProductOption[]>(`${API}/api/products`, 'No se pudieron cargar los productos.'),
  registeredCustomers: () => getJson<RegisteredCustomer[]>(`${API}/api/customers`, 'No se pudieron cargar los clientes.'),
};
