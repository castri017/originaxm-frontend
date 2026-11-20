import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, ShoppingBag } from 'lucide-react';
import { carteraApi } from './api';
import { dayOf, formatDay, money, todayInColombia } from './format';
import { inputClass, labelClass, parseMoney, primaryButton } from './styles';
import { Modal, ProductThumb } from './ui';
import type { CollectionMethod, CreditSale, CreditSaleDetail, RegisteredCustomer } from './types';

interface Props {
  sale: CreditSale;                     // termo sin vender
  registeredCustomers: RegisteredCustomer[];
  knownCustomerNames: string[];
  onClose: () => void;
  onSold: (message: string) => void;
}

const customerLabel = (c: RegisteredCustomer) => c.fullName || `${c.firstName} ${c.lastName}`.trim();

/** Vende un termo que ya se compró: le asigna cliente, fecha, valor y forma de cobro. */
export default function SellModal({ sale, registeredCustomers, knownCustomerNames, onClose, onSold }: Props) {
  const [detail, setDetail] = useState<CreditSaleDetail | null>(null);
  const [customerText, setCustomerText] = useState('');
  const [saleDate, setSaleDate] = useState(todayInColombia());
  const [price, setPrice] = useState(sale.sellingPrice > 0 ? String(sale.sellingPrice) : '');
  const [collection, setCollection] = useState<CollectionMethod>('Abonos');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Se lee la venta completa para no perder sus notas al guardarla.
  useEffect(() => {
    carteraApi.sale(sale.id).then(setDetail).catch(err => setError(err instanceof Error ? err.message : 'No se pudo cargar el termo.'));
  }, [sale.id]);

  const matched = useMemo(
    () => registeredCustomers.find(c => customerLabel(c).toLowerCase() === customerText.trim().toLowerCase()) ?? null,
    [registeredCustomers, customerText]);
  const value = parseMoney(price);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    if (!customerText.trim()) { setError('Indica el cliente.'); return; }
    if (value <= 0) { setError('Indica el valor de venta.'); return; }

    setSaving(true);
    setError('');
    try {
      await carteraApi.updateSale(sale.id, {
        productId: detail.productId,
        productName: detail.productId ? null : detail.productName,
        customerId: matched?.id ?? null,
        customerName: matched ? null : customerText.trim(),
        purchasePrice: detail.purchasePrice,
        sellingPrice: value,
        purchaseDate: dayOf(detail.purchaseDate) ?? todayInColombia(),
        saleDate,
        type: detail.type,
        collectionMethod: collection,
        voucherStatus: null,
        notes: detail.notes,
      });
      onSold(`${sale.productName} vendido a ${customerText.trim()} por ${money(value)}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la venta.');
      setSaving(false);
    }
  };

  return (
    <Modal title="Vender termo" onClose={onClose} busy={saving}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-sm px-4 py-3 text-sm">
          <ProductThumb src={sale.productImage} alt={sale.productName} />
          <div className="min-w-0">
            <p className="font-semibold">{sale.productName}</p>
            <p className="text-xs text-gray-500">Comprado el {formatDay(sale.purchaseDate)} por {money(sale.purchasePrice)}</p>
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="sell-customer">Cliente *</label>
          <input id="sell-customer" list="sell-customers" value={customerText} onChange={e => setCustomerText(e.target.value)}
            className={inputClass} placeholder="Escribe el nombre o elige un cliente registrado" autoComplete="off" autoFocus />
          <datalist id="sell-customers">
            {registeredCustomers.map(c => <option key={c.id} value={customerLabel(c)}>Registrado</option>)}
            {knownCustomerNames
              .filter(n => !registeredCustomers.some(c => customerLabel(c).toLowerCase() === n.toLowerCase()))
              .map(n => <option key={n} value={n} />)}
          </datalist>
          {matched && <p className="text-xs text-gray-400 mt-1">Cliente registrado en la tienda.</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="sell-price">Valor venta *</label>
            <input id="sell-price" inputMode="numeric" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="sell-date">Fecha venta</label>
            <input id="sell-date" type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="sell-collection">Forma de cobro</label>
          <select id="sell-collection" value={collection} onChange={e => setCollection(e.target.value as CollectionMethod)} className={inputClass}>
            <option value="Abonos">Abonos del cliente (1 mes)</option>
            <option value="Sistecredito">Sistecrédito (60 días)</option>
          </select>
        </div>
        {value > 0 && (
          <p className="text-sm text-gray-600">Ganancia: <b className="text-emerald-600">{money(value - sale.purchasePrice)}</b></p>
        )}
        {error && <p role="alert" className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" /> {error}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={saving || !detail} className={primaryButton}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />} Vender
          </button>
        </div>
      </form>
    </Modal>
  );
}
