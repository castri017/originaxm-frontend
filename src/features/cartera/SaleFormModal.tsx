import { useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { carteraApi } from './api';
import { dayOf, money, todayInColombia } from './format';
import { inputClass, labelClass, parseMoney, primaryButton, SALE_TYPE_LABEL } from './styles';
import { Modal } from './ui';
import type {
  CatalogProductOption, CollectionMethod, CreditSaleDetail, RegisteredCustomer, SaleInput, SaleType, VoucherStatus,
} from './types';

interface Props {
  sale: CreditSaleDetail | null;         // null = nueva
  products: CatalogProductOption[];
  registeredCustomers: RegisteredCustomer[];
  knownCustomerNames: string[];          // nombres ya usados en la cartera, para sugerirlos
  onClose: () => void;
  onSaved: () => void;
}

const customerLabel = (c: RegisteredCustomer) => c.fullName || `${c.firstName} ${c.lastName}`.trim();

export default function SaleFormModal({ sale, products, registeredCustomers, knownCustomerNames, onClose, onSaved }: Props) {
  const [productText, setProductText] = useState(sale?.productName ?? '');
  const [customerText, setCustomerText] = useState(sale?.customerName ?? '');
  const [type, setType] = useState<SaleType>(sale?.type ?? 'Normal');
  const [collection, setCollection] = useState<CollectionMethod>(sale?.collectionMethod ?? 'Abonos');
  const [voucher, setVoucher] = useState<VoucherStatus>(sale?.voucherStatus ?? 'Pendiente');
  const [purchasePrice, setPurchasePrice] = useState(sale ? String(sale.purchasePrice) : '');
  const [sellingPrice, setSellingPrice] = useState(sale ? String(sale.sellingPrice) : '');
  const [purchaseDate, setPurchaseDate] = useState(dayOf(sale?.purchaseDate) ?? todayInColombia());
  const [saleDate, setSaleDate] = useState(dayOf(sale?.saleDate) ?? (sale ? '' : todayInColombia()));
  const [notes, setNotes] = useState(sale?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Producto: si el texto coincide con uno del catálogo, se guarda relacionado; si no, como texto libre.
  const matchedProduct = useMemo(
    () => products.find(p => p.name.trim().toLowerCase() === productText.trim().toLowerCase()) ?? null,
    [products, productText]);
  // Cliente: igual, contra los clientes registrados en la tienda.
  const matchedCustomer = useMemo(
    () => registeredCustomers.find(c => customerLabel(c).toLowerCase() === customerText.trim().toLowerCase()) ?? null,
    [registeredCustomers, customerText]);

  const sold = customerText.trim().length > 0;
  const buy = type === 'Bono' ? 0 : parseMoney(purchasePrice);
  const sell = type === 'Devolucion' ? 0 : parseMoney(sellingPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productText.trim()) { setError('Indica el producto.'); return; }
    if (type !== 'Devolucion' && sell <= 0) { setError('Indica el valor de venta.'); return; }

    const input: SaleInput = {
      productId: matchedProduct?.id ?? null,
      productName: matchedProduct ? null : productText.trim(),
      customerId: matchedCustomer?.id ?? null,
      customerName: matchedCustomer ? null : customerText.trim() || null,
      purchasePrice: buy,
      sellingPrice: sell,
      purchaseDate,
      saleDate: sold && saleDate ? saleDate : null,
      type,
      collectionMethod: collection,
      voucherStatus: type === 'Devolucion' ? voucher : null,
      notes: notes.trim(),
    };

    setSaving(true);
    setError('');
    try {
      if (sale) await carteraApi.updateSale(sale.id, input);
      else await carteraApi.createSale(input);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la venta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={sale ? 'Editar venta' : 'Nueva venta'} onClose={onClose} busy={saving}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="cartera-product">Producto *</label>
          <input id="cartera-product" list="cartera-products" value={productText} onChange={e => setProductText(e.target.value)}
            className={inputClass} placeholder="Escribe o elige del catálogo" autoComplete="off" />
          <datalist id="cartera-products">
            {products.map(p => <option key={p.id} value={p.name} />)}
          </datalist>
          <p className="text-xs text-gray-400 mt-1">
            {matchedProduct ? 'Relacionado con el producto del catálogo.' : productText.trim() ? 'Se guardará como producto escrito a mano.' : ''}
          </p>
        </div>

        <div>
          <label className={labelClass} htmlFor="cartera-customer">Cliente</label>
          <input id="cartera-customer" list="cartera-customers" value={customerText} onChange={e => setCustomerText(e.target.value)}
            className={inputClass} placeholder="Déjalo vacío si el termo aún no se vende" autoComplete="off" />
          <datalist id="cartera-customers">
            {registeredCustomers.map(c => <option key={c.id} value={customerLabel(c)}>Registrado</option>)}
            {knownCustomerNames
              .filter(n => !registeredCustomers.some(c => customerLabel(c).toLowerCase() === n.toLowerCase()))
              .map(n => <option key={n} value={n} />)}
          </datalist>
          <p className="text-xs text-gray-400 mt-1">
            {matchedCustomer ? 'Cliente registrado en la tienda.' : sold ? 'Cliente sin cuenta (solo el nombre).' : 'Sin cliente: queda como "sin vender".'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="cartera-type">Tipo</label>
            <select id="cartera-type" value={type} onChange={e => setType(e.target.value as SaleType)} className={inputClass}>
              {(Object.keys(SALE_TYPE_LABEL) as SaleType[]).map(t => <option key={t} value={t}>{SALE_TYPE_LABEL[t]}</option>)}
            </select>
          </div>
          {type === 'Devolucion' ? (
            <div>
              <label className={labelClass} htmlFor="cartera-voucher">Bono de Amazon</label>
              <select id="cartera-voucher" value={voucher} onChange={e => setVoucher(e.target.value as VoucherStatus)} className={inputClass}>
                <option value="Pendiente">Pendiente</option>
                <option value="Recibido">Recibido</option>
                <option value="Usado">Usado</option>
              </select>
            </div>
          ) : (
            <div>
              <label className={labelClass} htmlFor="cartera-collection">Forma de cobro</label>
              <select id="cartera-collection" value={collection} onChange={e => setCollection(e.target.value as CollectionMethod)} className={inputClass}>
                <option value="Abonos">Abonos del cliente (1 mes)</option>
                <option value="Sistecredito">Sistecrédito (60 días)</option>
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="cartera-buy">Valor compra (Amazon)</label>
            <input id="cartera-buy" inputMode="numeric" value={type === 'Bono' ? '0' : purchasePrice}
              onChange={e => setPurchasePrice(e.target.value)} disabled={type === 'Bono'} className={inputClass} placeholder="0" />
            {type === 'Bono' && <p className="text-xs text-gray-400 mt-1">Comprado con bono: no salió dinero.</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="cartera-sell">Valor venta</label>
            <input id="cartera-sell" inputMode="numeric" value={type === 'Devolucion' ? '0' : sellingPrice}
              onChange={e => setSellingPrice(e.target.value)} disabled={type === 'Devolucion'} className={inputClass} placeholder="0" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="cartera-buy-date">Fecha compra Amazon</label>
            <input id="cartera-buy-date" type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="cartera-sale-date">Fecha venta</label>
            <input id="cartera-sale-date" type="date" value={sold ? saleDate : ''} onChange={e => setSaleDate(e.target.value)}
              disabled={!sold} className={inputClass} />
            {sold && !saleDate && <p className="text-xs text-gray-400 mt-1">Sin fecha: vence contando desde la compra.</p>}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="cartera-notes">Notas</label>
          <input id="cartera-notes" value={notes} onChange={e => setNotes(e.target.value)} className={inputClass}
            placeholder="Opcional" />
        </div>

        {type !== 'Devolucion' && sell > 0 && (
          <p className="text-sm text-gray-600">
            Ganancia: <span className="font-bold text-emerald-600">{money(sell - buy)}</span>
          </p>
        )}

        {error && (
          <p role="alert" className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving} className={primaryButton}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} {sale ? 'Guardar cambios' : 'Registrar venta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
