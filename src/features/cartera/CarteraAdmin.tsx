import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, PackagePlus, Plus, RefreshCw, Search, ShoppingBag, Trash2, Wallet, X } from 'lucide-react';
import { carteraApi } from './api';
import CustomerPaymentModal from './CustomerPaymentModal';
import ExpensesPanel from './ExpensesPanel';
import LoansPanel from './LoansPanel';
import SellModal from './SellModal';
import { formatDay, money } from './format';
import ImportPanel from './ImportPanel';
import NequiPanel from './NequiPanel';
import SaleDetailModal from './SaleDetailModal';
import SaleFormModal from './SaleFormModal';
import { inputClass, primaryButton, SALE_TYPE_LABEL, secondaryButton } from './styles';
import { StatCard, StatusBadge } from './ui';
import VerifyDeleteModal from './VerifyDeleteModal';
import type {
  CashAccount, CatalogProductOption, CreditCustomer, CreditExpense, CreditSale, CreditSaleDetail, CreditStats, Loan,
  LoansSummary, RegisteredCustomer, SaleStatus,
} from './types';

type Tab = 'ventas' | 'clientes' | 'prestamos' | 'gastos' | 'nequi' | 'importar';
type SaleFilter = 'pendientes' | 'vencidas' | 'sistecredito' | 'sinvender' | 'pagadas' | 'devoluciones' | 'todas';

const SALE_FILTERS: { value: SaleFilter; label: string; test: (s: CreditSale) => boolean }[] = [
  { value: 'pendientes',   label: 'Por cobrar',   test: s => s.status === 'AlDia' || s.status === 'Vencida' },
  { value: 'vencidas',     label: 'Vencidas',     test: s => s.status === 'Vencida' },
  { value: 'sistecredito', label: 'Sistecrédito', test: s => s.collectionMethod === 'Sistecredito' && (s.status === 'AlDia' || s.status === 'Vencida') },
  { value: 'sinvender',    label: 'Sin vender',   test: s => s.status === 'SinVender' },
  { value: 'pagadas',      label: 'Pagadas',      test: s => s.status === 'Pagado' },
  { value: 'devoluciones', label: 'Devoluciones', test: s => s.status === 'Devolucion' },
  { value: 'todas',        label: 'Todas',        test: () => true },
];

const STATUS_ORDER: Record<SaleStatus, number> = { Vencida: 0, AlDia: 1, SinVender: 2, Pagado: 3, Devolucion: 4 };

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Campo para filtrar por nombre de cliente, en el encabezado de la columna; sugiere los nombres conocidos. */
function ClientFilter({ value, onChange, names }: { value: string; onChange: (v: string) => void; names: string[] }) {
  return (
    <div className="relative normal-case tracking-normal font-normal">
      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input value={value} onChange={e => onChange(e.target.value)} list="cartera-client-names"
        placeholder="Filtrar por cliente" aria-label="Filtrar por nombre de cliente" autoComplete="off"
        className="w-44 pl-8 pr-7 py-1.5 text-xs text-gray-800 border border-gray-200 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10" />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Quitar filtro de cliente"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-black"><X className="w-3.5 h-3.5" /></button>
      )}
      <datalist id="cartera-client-names">{names.map(n => <option key={n} value={n} />)}</datalist>
    </div>
  );
}

export default function CarteraAdmin() {
  const [tab, setTab] = useState<Tab>('ventas');
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [sales, setSales] = useState<CreditSale[]>([]);
  const [customers, setCustomers] = useState<CreditCustomer[]>([]);
  const [nequi, setNequi] = useState<CashAccount | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loansSummary, setLoansSummary] = useState<LoansSummary | null>(null);
  const [expenses, setExpenses] = useState<CreditExpense[]>([]);
  const [products, setProducts] = useState<CatalogProductOption[]>([]);
  const [registered, setRegistered] = useState<RegisteredCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [filter, setFilter] = useState<SaleFilter>('pendientes');
  const [search, setSearch] = useState('');
  const [clientQuery, setClientQuery] = useState('');   // filtro por nombre de cliente (ventas y clientes)
  const [customerFilter, setCustomerFilter] = useState<CreditCustomer | null>(null);

  const [formSale, setFormSale] = useState<CreditSaleDetail | null | undefined>(undefined);  // undefined = cerrado
  const [formMode, setFormMode] = useState<'sale' | 'purchase'>('sale');
  const [selling, setSelling] = useState<CreditSale | null>(null);
  const [detail, setDetail] = useState<CreditSaleDetail | null>(null);
  const [payingCustomer, setPayingCustomer] = useState<CreditCustomer | null>(null);
  const [deletingSale, setDeletingSale] = useState<CreditSale | null>(null);

  const reload = useCallback(async () => {
    setError('');
    try {
      const [s, list, c, n, l, ls, ex] = await Promise.all([
        carteraApi.stats(), carteraApi.sales(), carteraApi.customers(), carteraApi.nequi(),
        carteraApi.loans(), carteraApi.loansSummary(), carteraApi.expenses(),
      ]);
      setStats(s); setSales(list); setCustomers(c); setNequi(n);
      setLoans(l); setLoansSummary(ls); setExpenses(ex);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la cartera.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    // El catálogo y los clientes registrados solo sirven para elegir: si fallan, se escribe a mano.
    carteraApi.catalogProducts().then(setProducts).catch(() => setProducts([]));
    carteraApi.registeredCustomers().then(setRegistered).catch(() => setRegistered([]));
  }, [reload]);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(n => (n === message ? '' : n)), 6000);
  };

  const openDetail = async (id: string) => {
    try { setDetail(await carteraApi.sale(id)); }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo abrir la venta.'); }
  };

  const visibleSales = useMemo(() => {
    const rule = SALE_FILTERS.find(f => f.value === filter)!;
    const q = normalize(search.trim());
    const cq = normalize(clientQuery.trim());
    return sales
      .filter(rule.test)
      .filter(s => !customerFilter || (customerFilter.customerId
        ? s.customerId === customerFilter.customerId
        : !s.customerId && normalize(s.customerName.trim()) === normalize(customerFilter.customerName.trim())))
      .filter(s => !q || normalize(`${s.customerName} ${s.productName}`).includes(q))
      .filter(s => !cq || normalize(s.customerName).includes(cq))
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.daysOverdue - a.daysOverdue);
  }, [sales, filter, search, clientQuery, customerFilter]);

  const visibleTotal = visibleSales.reduce((sum, s) => sum + s.balance, 0);
  const visibleCustomers = customers.filter(c => !clientQuery.trim() || normalize(c.customerName).includes(normalize(clientQuery.trim())));
  const expensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const interestCollected = loansSummary?.interestCollected ?? 0;
  const netProfit = (stats?.expectedProfit ?? 0) + interestCollected - expensesTotal;
  const knownNames = useMemo(() => [...new Set(sales.map(s => s.customerName).filter(Boolean))].sort(), [sales]);
  const filterCount = (f: SaleFilter) => sales.filter(SALE_FILTERS.find(x => x.value === f)!.test).length;

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-gray-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando cartera...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-sm text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> <span className="flex-1">{error}</span>
          <button onClick={reload} className="flex items-center gap-1 text-xs font-bold hover:underline"><RefreshCw className="w-3.5 h-3.5" /> Reintentar</button>
        </div>
      )}
      {notice && (
        <div role="status" className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-sm text-sm text-emerald-700">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {notice}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Cartera por cobrar" value={money(stats.totalBalance)}
            hint={`${stats.customersWithBalance} cliente${stats.customersWithBalance !== 1 ? 's' : ''} · ${stats.pendingCount} venta${stats.pendingCount !== 1 ? 's' : ''}`} tone="warning" />
          <StatCard label="Cartera vencida" value={money(stats.overdueBalance)}
            hint={`${stats.customersOverdue} cliente${stats.customersOverdue !== 1 ? 's' : ''} · ${stats.overdueCount} venta${stats.overdueCount !== 1 ? 's' : ''}`} tone={stats.overdueBalance > 0 ? 'danger' : 'default'} />
          <StatCard label="Sistecrédito por recibir" value={money(stats.sistecreditoPending)} hint="Desembolsa a 60 días" />
          <StatCard label="Saldo Nequi esperado" value={money(nequi?.expectedBalance ?? 0)} hint="Con compras, 4×1000, abonos e intereses" />
          <StatCard label="Ganancia de lo vendido" value={money(stats.expectedProfit)} hint={`Cobrado: ${money(stats.totalCollected)}`} tone="success" />
          <StatCard label="Sin vender" value={`${stats.inventoryCount} termo${stats.inventoryCount !== 1 ? 's' : ''}`}
            hint={`Costo ${money(stats.inventoryCost)} · venta ${money(stats.inventoryExpectedSale)}`} />
          <StatCard label="Bonos Amazon pendientes" value={money(stats.pendingVouchers)} hint="Por devoluciones" />
          <StatCard label="Comprado en Amazon" value={money(stats.totalPurchased)} hint={`${sales.length} registro${sales.length !== 1 ? 's' : ''}`} />
          <StatCard label="Prestado" value={money(loansSummary?.totalLent ?? 0)}
            hint={`${loansSummary?.activeCount ?? 0} préstamo${loansSummary?.activeCount !== 1 ? 's' : ''} · ${money(loansSummary?.expectedMonthlyInterest ?? 0)} de interés al mes`} />
          <StatCard label="Intereses recaudados" value={money(interestCollected)}
            hint={loansSummary?.interestPending ? `Pendiente por recaudar: ${money(loansSummary.interestPending)}` : 'Sin intereses pendientes'} tone="success" />
          <StatCard label="Gastos" value={money(expensesTotal)} hint={`${expenses.length} gasto${expenses.length !== 1 ? 's' : ''}`} tone={expensesTotal > 0 ? 'danger' : 'default'} />
          <StatCard label="Ganancia neta" value={money(netProfit)} hint="Ventas + intereses − gastos" tone={netProfit >= 0 ? 'success' : 'danger'} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100">
        <div className="flex gap-1 overflow-x-auto">
          {([['ventas', 'Ventas'], ['clientes', 'Clientes'], ['prestamos', 'Préstamos'], ['gastos', 'Gastos'], ['nequi', 'Nequi'], ['importar', 'Importar Excel']] as [Tab, string][]).map(([value, label]) => (
            <button key={value} onClick={() => setTab(value)}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${tab === value ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>
        {tab === 'ventas' && (
          <div className="flex gap-2 mb-2">
            <button onClick={() => { setFormMode('purchase'); setFormSale(null); }} className={secondaryButton}>
              <PackagePlus className="w-4 h-4" /> Registrar compra
            </button>
            <button onClick={() => { setFormMode('sale'); setFormSale(null); }} className={primaryButton}>
              <Plus className="w-4 h-4" /> Nueva venta
            </button>
          </div>
        )}
      </div>

      {tab === 'ventas' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {SALE_FILTERS.map(f => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${filter === f.value ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {f.label} <span className="opacity-60">{filterCount(f.value)}</span>
              </button>
            ))}
            <div className="relative ml-auto w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente o producto"
                className={`${inputClass} pl-9 py-2`} aria-label="Buscar cliente o producto" />
            </div>
          </div>

          {customerFilter && (
            <p className="flex items-center gap-2 text-sm text-gray-600">
              Ventas de <b>{customerFilter.customerName}</b>
              <button onClick={() => setCustomerFilter(null)} className="text-xs font-bold underline">Ver todos</button>
            </p>
          )}

          <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-x-auto">
            {sales.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Aún no hay ventas. Regístralas o importa tu Excel.</p>
              </div>
            ) : (
              <table className="w-full text-sm min-w-[860px]">
                <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left align-top">
                    <span className="block mb-1.5">Cliente</span>
                    <ClientFilter value={clientQuery} onChange={setClientQuery} names={knownNames} />
                  </th>
                    <th className="px-4 py-2.5 text-left">Producto</th>
                    <th className="px-4 py-2.5 text-right">Venta</th>
                    <th className="px-4 py-2.5 text-right">Abonado</th>
                    <th className="px-4 py-2.5 text-right">Saldo</th>
                    <th className="px-4 py-2.5 text-left">Estado</th>
                    <th className="px-4 py-2.5 text-left">Vence</th>
                    <th className="px-2 py-2.5"><span className="sr-only">Eliminar</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleSales.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                      No hay ventas {clientQuery.trim() ? `de "${clientQuery.trim()}" ` : ''}con este filtro.
                    </td></tr>
                  )}
                  {visibleSales.map(s => (
                    <tr key={s.id} onClick={() => openDetail(s.id)} className="cursor-pointer hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-semibold">{s.customerName || <span className="text-gray-400 font-normal">—</span>}</td>
                      <td className="px-4 py-2.5 max-w-[22rem]">
                        <p className="truncate" title={s.productName}>{s.productName}</p>
                        <p className="text-xs text-gray-400">
                          {s.type !== 'Normal' && `${SALE_TYPE_LABEL[s.type]} · `}
                          {s.collectionMethod === 'Sistecredito' && 'Sistecrédito · '}
                          Compra {money(s.purchasePrice)} · ganancia {money(s.margin)}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 text-right">{money(s.sellingPrice)}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500">{money(s.amountPaid)}</td>
                      <td className={`px-4 py-2.5 text-right font-bold ${s.balance > 0 ? 'text-red-600' : 'text-gray-400'}`}>{money(s.balance)}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={s.status} daysOverdue={s.daysOverdue} /></td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{formatDay(s.dueDate)}</td>
                      <td className="px-2 py-2.5 text-right whitespace-nowrap">
                        {s.status === 'SinVender' && (
                          <button onClick={e => { e.stopPropagation(); setSelling(s); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 mr-1 text-xs font-bold bg-black text-white rounded-full hover:bg-gray-800">
                            <ShoppingBag className="w-3.5 h-3.5" /> Vender
                          </button>
                        )}
                        <button onClick={e => { e.stopPropagation(); setDeletingSale(s); }}
                          aria-label={`Eliminar ${s.productName}${s.customerName ? ` de ${s.customerName}` : ''}`} title="Eliminar"
                          className="p-1.5 text-gray-300 hover:text-red-600 rounded-sm hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 text-sm">
                  <tr>
                    <td className="px-4 py-2.5 font-bold" colSpan={4}>{visibleSales.length} registro{visibleSales.length !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-2.5 text-right font-extrabold">{money(visibleTotal)}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'clientes' && (
        <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-x-auto">
          {customers.length === 0 ? (
            <p className="text-center py-16 text-sm text-gray-400">Aún no hay clientes con ventas.</p>
          ) : (
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-2.5 text-left align-top">
                    <span className="block mb-1.5">Cliente</span>
                    <ClientFilter value={clientQuery} onChange={setClientQuery} names={knownNames} />
                  </th>
                  <th className="px-4 py-2.5 text-right">Debe</th>
                  <th className="px-4 py-2.5 text-right">Vencido</th>
                  <th className="px-4 py-2.5 text-left">Estado</th>
                  <th className="px-4 py-2.5 text-left">Pendiente desde</th>
                  <th className="px-4 py-2.5 text-right">Comprado</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleCustomers.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No hay clientes que coincidan con "{clientQuery.trim()}".</td></tr>
                )}
                {visibleCustomers.map(c => (
                  <tr key={c.key}>
                    <td className="px-4 py-2.5">
                      <p className="font-semibold">{c.customerName}</p>
                      <p className="text-xs text-gray-400">{c.saleCount} compra{c.saleCount !== 1 ? 's' : ''}{c.customerId ? ' · registrado' : ''}</p>
                    </td>
                    <td className={`px-4 py-2.5 text-right font-bold ${c.balance > 0 ? 'text-black' : 'text-gray-400'}`}>{money(c.balance)}</td>
                    <td className={`px-4 py-2.5 text-right ${c.overdueBalance > 0 ? 'text-red-600 font-bold' : 'text-gray-300'}`}>{money(c.overdueBalance)}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={c.status} daysOverdue={c.maxDaysOverdue} /></td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{formatDay(c.oldestPendingSaleDate)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500">{money(c.totalSold)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setCustomerFilter(c); setFilter('todas'); setTab('ventas'); }} className={secondaryButton}>Ver ventas</button>
                        {c.balance > 0 && <button onClick={() => setPayingCustomer(c)} className={secondaryButton}>Abonar</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'prestamos' && <LoansPanel loans={loans} onChanged={message => { if (message) flash(message); reload(); }} />}

      {tab === 'gastos' && <ExpensesPanel expenses={expenses} onChanged={message => { if (message) flash(message); reload(); }} />}

      {tab === 'nequi' && <NequiPanel key={nequi ? 'loaded' : 'loading'} account={nequi} onSaved={a => { setNequi(a); flash('Cuenta Nequi actualizada.'); }} />}

      {tab === 'importar' && (
        <ImportPanel products={products} existingSales={sales.length}
          onImported={message => { flash(message); setTab('ventas'); setFilter('pendientes'); reload(); }} />
      )}

      {formSale !== undefined && (
        <SaleFormModal
          sale={formSale}
          mode={formMode}
          products={products}
          registeredCustomers={registered}
          knownCustomerNames={knownNames}
          onClose={() => setFormSale(undefined)}
          onSaved={() => { setFormSale(undefined); setDetail(null); flash(formMode === 'purchase' ? 'Compra registrada: queda en "Sin vender".' : 'Venta guardada.'); reload(); }}
        />
      )}

      {detail && (
        <SaleDetailModal
          sale={detail}
          onClose={() => setDetail(null)}
          onEdit={sale => { setDetail(null); setFormMode('sale'); setFormSale(sale); }}
          onSell={sale => { setDetail(null); setSelling(sale); }}
          onChanged={updated => {
            setDetail(updated);
            if (!updated) flash('Venta eliminada.');
            reload();
          }}
        />
      )}

      {selling && (
        <SellModal
          sale={selling}
          registeredCustomers={registered}
          knownCustomerNames={knownNames}
          onClose={() => setSelling(null)}
          onSold={message => { setSelling(null); flash(message); reload(); }}
        />
      )}

      {deletingSale && (
        <VerifyDeleteModal
          title="Eliminar venta"
          description={`Se eliminará "${deletingSale.productName}"${deletingSale.customerName ? ` de ${deletingSale.customerName}` : ''}${deletingSale.paymentCount ? ` con sus ${deletingSale.paymentCount} abono${deletingSale.paymentCount !== 1 ? 's' : ''}` : ''}.`}
          onConfirm={async code => {
            await carteraApi.deleteSale(deletingSale.id, code);
            setDeletingSale(null);
            flash('Venta eliminada.');
            reload();
          }}
          onClose={() => setDeletingSale(null)}
        />
      )}

      {payingCustomer && (
        <CustomerPaymentModal
          customer={payingCustomer}
          onClose={() => setPayingCustomer(null)}
          onSaved={message => { setPayingCustomer(null); flash(message); reload(); }}
        />
      )}
    </div>
  );
}
