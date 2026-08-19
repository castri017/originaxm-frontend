import React, { useState } from 'react';
import { API } from '../config/api';
import { Settings, Tag, Users, Package, TrendingUp, Plus, Edit, Trash2, ClipboardList, Eye, ArrowLeft, X, ShieldCheck, Lock, Mail, Loader2, AlertCircle, LogOut, BarChart3, DollarSign, RefreshCw, ChevronLeft, ChevronDown, Truck, FileBarChart2, Star, Globe, Wallet } from 'lucide-react';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import { useCatalogStore } from '../store/useCatalogStore';

const ORDER_STATUSES = ['Procesando', 'Picking', 'Enviado', 'En Tránsito', 'Entregado', 'Cancelado'];

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  'Procesando':  { label: 'Procesando',  color: 'bg-yellow-100 text-yellow-800 border-yellow-200',  dot: 'bg-yellow-400' },
  'Picking':     { label: 'Picking',     color: 'bg-purple-100 text-purple-800 border-purple-200',  dot: 'bg-purple-400' },
  'Enviado':     { label: 'Enviado',     color: 'bg-sky-100 text-sky-800 border-sky-200',           dot: 'bg-sky-400' },
  'En Tránsito': { label: 'En Tránsito', color: 'bg-blue-100 text-blue-800 border-blue-200',        dot: 'bg-blue-400' },
  'Entregado':   { label: 'Entregado',   color: 'bg-green-100 text-green-800 border-green-200',     dot: 'bg-green-400' },
  'Cancelado':   { label: 'Cancelado',   color: 'bg-red-100 text-red-800 border-red-200',           dot: 'bg-red-400' },
};

interface ApiCarrier {
  id: string;
  name: string;
  contactInfo?: string;
  isActive: boolean;
  createdAt: string;
}

interface ApiOrderItem {
  id: string;
  productId?: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface ApiOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDocument: string;
  customerAddress: string;
  customerCity: string;
  customerId?: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  trackingNumber?: string;
  carrier?: string;
  notes: string;
  referenceCode?: string;
  paymentMethod?: string;
  items: ApiOrderItem[];
}


interface ApiCustomer {
  id: string;
  username?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

const EMPTY_CUSTOMER_FORM = {
  firstName: '', lastName: '', email: '', phone: '', address: '', city: '', notes: '', isActive: true,
};

interface InventoryProduct {
  id: string;
  productCode: string;
  name: string;
  manufacturer: string;
  categoryName: string;
  brandName: string;
  image: string;
  stock: number;
  totalEntradas: number;
  totalSalidas: number;
}

interface StockMovementRecord {
  id: string;
  productId: string;
  productName: string;
  type: 'Entrada' | 'Salida' | 'Ajuste';
  quantity: number;
  previousStock: number;
  newStock: number;
  notes: string;
  createdAt: string;
}

interface ApiSubType     { id: string; name: string; }
interface ApiProductType { id: string; name: string; subTypes?: ApiSubType[]; }
interface ApiBrand       { id: string; name: string; types: ApiProductType[]; }
interface ApiCategory    { id: string; name: string; description: string; createdAt: string; brands: ApiBrand[]; }

interface ApiProduct {
  id: string;
  productCode: string;
  name: string;
  description: string;
  manufacturer: string;
  categoryId: string;
  brandId?: string;
  typeId?: string;
  subTypeId?: string;
  images: string[];
  sellingPrice: number;
  discountPercentage: number;
  stock: number;
  isRecommended: boolean;
  recommendedOrder: number;
  isFeatured: boolean;
  featuredOrder: number;
  isInternational: boolean;
  variantGroupId?: string | null;
}

// ── Price List types ──────────────────────────────────────
interface ProductPriceListItem {
  itemId: string;
  priceListId: string;
  priceListName: string;
  characteristic: string;
  purchasePrice: number;
  sellingPrice: number;
  discountPercent: number;
  finalPrice: number;
  marginPercent: number;
}

interface PriceListItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  productImage: string;
  characteristic: string;
  purchasePrice: number;
  sellingPrice: number;
  discountPercent: number;
  finalPrice: number;
  marginPercent: number;
}

interface PriceListSummary {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  itemCount: number;
}

interface PriceListDetail {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  items: PriceListItem[];
}

// ── Credit Sales ("Gastos") types ──────────────────────────
interface CreditPayment {
  id: string;
  creditSaleId: string;
  amount: number;
  paymentDate: string;
  notes: string | null;
  createdAt: string;
}

interface CreditSaleSummary {
  id: string;
  productId: string | null;
  productName: string;
  productCode: string;
  productImage: string;
  customerId: string | null;
  customerName: string;
  purchasePrice: number;
  sellingPrice: number;
  margin: number;
  marginPercent: number;
  purchaseDate: string;
  amountPaid: number;
  balance: number;
  isPaid: boolean;
  paymentCount: number;
}

interface CreditSaleDetail extends CreditSaleSummary {
  notes: string;
  createdAt: string;
  updatedAt: string | null;
  payments: CreditPayment[];
}

interface CreditSalesStats {
  totalPurchased: number;
  totalCollected: number;
  totalCommittedSelling: number;
  profit: number;
  totalBalance: number;
  saleCount: number;
  paidCount: number;
  pendingCount: number;
}

// ─── Login Screen ────────────────────────────────────────────────────────────
function AdminLogin() {
  const login = useAdminAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError('Credenciales incorrectas. Intente nuevamente.');
        return;
      }
      const data = await res.json();
      if (data.role !== 'SuperAdmin') {
        setError('No tienes permisos de administrador.');
        return;
      }
      login(data.token, data.email, data.fullName, data.role);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <img src="/logo.png" alt="OrigenAXM" className="h-24 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold text-black tracking-tight">Panel Admin</h1>
          <p className="text-gray-500 mt-2 text-sm">Acceso restringido — OrigenAXM</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@origenaxm.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-black transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-black transition-all text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-sm transition-colors uppercase tracking-wider text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Panel ─────────────────────────────────────────────────────────────
export default function Admin() {
  const { isAuthenticated, role } = useAdminAuthStore();

  if (!isAuthenticated || role !== 'SuperAdmin') return <AdminLogin />;

  return <AdminPanel />;
}

function AdminPanel() {
  const { fullName, email, logout } = useAdminAuthStore();
  const invalidateCatalog = useCatalogStore((s) => s.invalidate);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // ── Earnings report ──────────────────────────────────────────────────────
  const [reportAllOrders, setReportAllOrders] = useState<ApiOrder[]>([]);
  const [reportAllLoading, setReportAllLoading] = useState(false);
  const [reportTab, setReportTab] = useState<'earnings' | 'shipping'>('earnings');
  const [reportYear, setReportYear] = useState(new Date().getFullYear().toString());
  const [reportMonth, setReportMonth] = useState('0');
  const [reportDay, setReportDay] = useState('0');

  // ── Recommended state ────────────────────────────────────────────────────
  const [recSavingId, setRecSavingId] = useState<string | null>(null);
  const [recOrderEdits, setRecOrderEdits] = useState<Record<string, number>>({});

  // ── Featured state ────────────────────────────────────────────────────────
  const [featSavingId, setFeatSavingId] = useState<string | null>(null);
  const [featOrderEdits, setFeatOrderEdits] = useState<Record<string, number>>({});

  // ── International state ─────────────────────────────────────────────────
  const [intlSavingId, setIntlSavingId] = useState<string | null>(null);

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  const [productsLoading, setProductsLoading] = useState(true);

  const fetchOrders = async (status?: string, search?: string) => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const url = `${API}/api/orders${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url);
      if (res.ok) setOrders(await res.json());
      else setOrdersError('No se pudo cargar los pedidos.');
    } catch {
      setOrdersError('Error de conexión con la API.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    setReportAllLoading(true);
    try {
      const res = await fetch(`${API}/api/orders`);
      if (res.ok) setReportAllOrders(await res.json());
    } catch {}
    finally { setReportAllLoading(false); }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch(`${API}/api/products`);
      if (res.ok) setProducts(await res.json());
    } catch { /* silencioso */ }
    finally { setProductsLoading(false); }
  };

  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await fetch(`${API}/api/categories`);
      if (res.ok) setCategories(await res.json());
    } finally {
      setCatLoading(false);
    }
  };

  // ── Carriers state ────────────────────────────────────────────────────
  const [carriers, setCarriers]           = useState<ApiCarrier[]>([]);
  const [carriersLoading, setCarriersLoading] = useState(false);
  const [showCarrierModal, setShowCarrierModal] = useState(false);
  const [editingCarrier, setEditingCarrier]     = useState<ApiCarrier | null>(null);
  const [carrierForm, setCarrierForm]           = useState({ name: '', contactInfo: '', isActive: true });
  const [carrierError, setCarrierError]         = useState('');
  const [carrierSaving, setCarrierSaving]       = useState(false);

  const fetchCarriers = async () => {
    setCarriersLoading(true);
    try {
      const res = await fetch(`${API}/api/carriers`);
      if (res.ok) setCarriers(await res.json());
    } catch { /* silencioso */ }
    finally { setCarriersLoading(false); }
  };

  const openNewCarrier = () => {
    setEditingCarrier(null);
    setCarrierForm({ name: '', contactInfo: '', isActive: true });
    setCarrierError('');
    setShowCarrierModal(true);
  };

  const openEditCarrier = (c: ApiCarrier) => {
    setEditingCarrier(c);
    setCarrierForm({ name: c.name, contactInfo: c.contactInfo ?? '', isActive: c.isActive });
    setCarrierError('');
    setShowCarrierModal(true);
  };

  const handleSaveCarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrierForm.name.trim()) { setCarrierError('El nombre es obligatorio.'); return; }
    setCarrierSaving(true);
    setCarrierError('');
    try {
      const url = editingCarrier
        ? `${API}/api/carriers/${editingCarrier.id}`
        : `${API}/api/carriers`;
      const method = editingCarrier ? 'PUT' : 'POST';
      const body = editingCarrier
        ? { name: carrierForm.name.trim(), contactInfo: carrierForm.contactInfo.trim() || null, isActive: carrierForm.isActive }
        : { name: carrierForm.name.trim(), contactInfo: carrierForm.contactInfo.trim() || null };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setCarrierError(d.message ?? 'Error al guardar.'); return; }
      setShowCarrierModal(false);
      fetchCarriers();
    } catch { setCarrierError('Error de conexión.'); }
    finally { setCarrierSaving(false); }
  };

  const handleDeleteCarrier = async (id: string) => {
    if (!confirm('¿Eliminar esta transportadora?')) return;
    await fetch(`${API}/api/carriers/${id}`, { method: 'DELETE' });
    fetchCarriers();
  };

  // ── Customers state ───────────────────────────────────────────────────
  const [clients, setClients]           = useState<ApiCustomer[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientModal, setShowClientModal]     = useState(false);
  const [editingClient, setEditingClient]         = useState<ApiCustomer | null>(null);
  const [detailClient, setDetailClient]           = useState<ApiCustomer | null>(null);
  const [clientForm, setClientForm]               = useState(EMPTY_CUSTOMER_FORM);
  const [clientSaving, setClientSaving]           = useState(false);
  const [clientError, setClientError]             = useState('');

  const fetchClients = async (search?: string) => {
    setClientsLoading(true);
    try {
      const url = search
        ? `${API}/api/customers?search=${encodeURIComponent(search)}`
        : `${API}/api/customers`;
      const res = await fetch(url);
      if (res.ok) setClients(await res.json());
    } catch { /* silencioso */ }
    finally { setClientsLoading(false); }
  };

  const openNewClient = () => {
    setEditingClient(null);
    setClientForm(EMPTY_CUSTOMER_FORM);
    setClientError('');
    setShowClientModal(true);
  };

  const openEditClient = (c: ApiCustomer) => {
    setEditingClient(c);
    setClientForm({
      firstName: c.firstName, lastName: c.lastName,
      email: c.email, phone: c.phone,
      address: c.address, city: c.city,
      notes: c.notes, isActive: c.isActive,
    });
    setClientError('');
    setShowClientModal(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientSaving(true); setClientError('');
    try {
      const url  = editingClient
        ? `${API}/api/customers/${editingClient.id}`
        : `${API}/api/customers`;
      const method = editingClient ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientForm),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Error al guardar.');
      }
      const saved = await res.json().catch(() => null);
      setShowClientModal(false);
      await fetchClients();
      if (quickAddCustomer && saved?.id) {
        setNewCreditSaleForm(f => ({ ...f, customerId: saved.id }));
        setQuickAddCustomer(false);
      }
    } catch (err: unknown) {
      setClientError(err instanceof Error ? err.message : 'Error desconocido.');
    } finally {
      setClientSaving(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')) return;
    await fetch(`${API}/api/customers/${id}`, { method: 'DELETE' });
    await fetchClients();
  };

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // ── Inventory state ────────────────────────────────────────────────────
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([]);
  const [inventoryLoading, setInventoryLoading]   = useState(false);
  const [inventoryError, setInventoryError]       = useState('');
  const [inventorySearch, setInventorySearch]     = useState('');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementProduct, setMovementProduct]     = useState<InventoryProduct | null>(null);
  const [movForm, setMovForm] = useState({ type: 'Entrada', quantity: '', notes: '' });
  const [movError, setMovError]   = useState('');
  const [movSaving, setMovSaving] = useState(false);
  const [showHistoryModal, setShowHistoryModal]   = useState(false);
  const [historyProduct, setHistoryProduct]       = useState<InventoryProduct | null>(null);
  const [historyMovements, setHistoryMovements]   = useState<StockMovementRecord[]>([]);
  const [historyLoading, setHistoryLoading]       = useState(false);
  const [quickAdjustingId, setQuickAdjustingId]   = useState<string | null>(null);

  const handleQuickAdjust = async (product: InventoryProduct, type: 'Entrada' | 'Salida') => {
    if (type === 'Salida' && product.stock <= 0) return;
    setQuickAdjustingId(product.id);
    try {
      const res = await fetch(`${API}/api/inventory/${product.id}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, quantity: 1, notes: 'Ajuste rápido desde inventario' }),
      });
      if (res.ok) {
        await fetchInventory();
        invalidateCatalog();
      }
    } catch { /* silencioso */ }
    finally { setQuickAdjustingId(null); }
  };

  // Edit movement
  const [editingMovement, setEditingMovement]     = useState<StockMovementRecord | null>(null);
  const [editMovForm, setEditMovForm]             = useState({ type: 'Entrada', quantity: '', notes: '' });
  const [editMovError, setEditMovError]           = useState('');
  const [editMovSaving, setEditMovSaving]         = useState(false);

  const fetchInventory = async () => {
    setInventoryLoading(true);
    setInventoryError('');
    try {
      const res = await fetch(`${API}/api/inventory`);
      if (res.ok) setInventoryProducts(await res.json());
      else setInventoryError('No se pudo cargar el inventario. Verifica que la API esté en línea.');
    } catch {
      setInventoryError('Error de conexión con la API. Verifica que el servidor esté corriendo.');
    } finally {
      setInventoryLoading(false);
    }
  };

  const openMovementModal = (product: InventoryProduct) => {
    setMovementProduct(product);
    setMovForm({ type: 'Entrada', quantity: '', notes: '' });
    setMovError('');
    setShowMovementModal(true);
  };

  const refreshHistory = async (productId: string) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API}/api/inventory/${productId}/movements`);
      if (res.ok) setHistoryMovements(await res.json());
    } finally {
      setHistoryLoading(false);
    }
  };

  const openHistoryModal = async (product: InventoryProduct) => {
    setHistoryProduct(product);
    setHistoryMovements([]);
    setShowHistoryModal(true);
    await refreshHistory(product.id);
  };

  const handleDeleteMovement = async (movementId: string) => {
    if (!historyProduct) return;
    if (!confirm('¿Eliminar este movimiento? El stock será revertido.')) return;
    await fetch(`${API}/api/inventory/${historyProduct.id}/movements/${movementId}`, { method: 'DELETE' });
    await refreshHistory(historyProduct.id);
    await fetchInventory();
    invalidateCatalog();
  };

  const openEditMovement = (mov: StockMovementRecord) => {
    setEditingMovement(mov);
    setEditMovForm({ type: mov.type, quantity: String(mov.quantity), notes: mov.notes });
    setEditMovError('');
  };

  const handleEditMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovement || !historyProduct) return;
    const qty = Number(editMovForm.quantity);
    if (!qty || qty <= 0) { setEditMovError('La cantidad debe ser mayor a 0.'); return; }
    setEditMovSaving(true); setEditMovError('');
    try {
      const res = await fetch(
        `${API}/api/inventory/${historyProduct.id}/movements/${editingMovement.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: editMovForm.type, quantity: qty, notes: editMovForm.notes }),
        }
      );
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error'); }
      setEditingMovement(null);
      await refreshHistory(historyProduct.id);
      await fetchInventory();
      invalidateCatalog();
    } catch (err: unknown) {
      setEditMovError(err instanceof Error ? err.message : 'Error desconocido.');
    } finally {
      setEditMovSaving(false);
    }
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementProduct) return;
    const qty = Number(movForm.quantity);
    if (!qty || qty <= 0) { setMovError('La cantidad debe ser mayor a 0.'); return; }
    setMovError('');
    setMovSaving(true);
    try {
      const res = await fetch(`${API}/api/inventory/${movementProduct.id}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: movForm.type, quantity: qty, notes: movForm.notes }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error'); }
      setShowMovementModal(false);
      await fetchInventory();
      invalidateCatalog();
    } catch (err: unknown) {
      setMovError(err instanceof Error ? err.message : 'Error desconocido.');
    } finally {
      setMovSaving(false);
    }
  };

  // ── Price list state ──────────────────────────────────────────────────
  const [priceLists, setPriceLists]       = useState<PriceListSummary[]>([]);
  const [priceListLoading, setPriceListLoading] = useState(false);
  const [selectedPriceList, setSelectedPriceList] = useState<PriceListDetail | null>(null);
  const [showNewPriceListModal, setShowNewPriceListModal] = useState(false);
  const [newPLName, setNewPLName]         = useState('');
  const [newPLDesc, setNewPLDesc]         = useState('');
  const [plSaving, setPlSaving]           = useState(false);
  const [showAddItemModal, setShowAddItemModal]   = useState(false);
  const [itemForm, setItemForm] = useState({
    productId: '', characteristic: '', purchasePrice: '', sellingPrice: '', discountPercent: '0'
  });
  const [itemSaving, setItemSaving]       = useState(false);
  const [itemError, setItemError]         = useState('');
  const [editingItem, setEditingItem]         = useState<PriceListItem | null>(null);
  const [plItemEditForm, setPlItemEditForm]   = useState({ characteristic: '', purchasePrice: '', sellingPrice: '', discountPercent: '0' });
  const [plItemEditSaving, setPlItemEditSaving] = useState(false);
  const [plItemEditError, setPlItemEditError]   = useState('');

  // ── Credit sales ("Gastos") state ──────────────────────────────────────
  const [creditSales, setCreditSales]       = useState<CreditSaleSummary[]>([]);
  const [creditSalesLoading, setCreditSalesLoading] = useState(false);
  const [creditStats, setCreditStats]       = useState<CreditSalesStats | null>(null);
  const [selectedCreditSale, setSelectedCreditSale] = useState<CreditSaleDetail | null>(null);
  const [creditCustomerFilter, setCreditCustomerFilter] = useState('');
  const [showNewCreditSaleModal, setShowNewCreditSaleModal] = useState(false);
  const [newCreditSaleForm, setNewCreditSaleForm] = useState({
    productId: '', customerId: '', purchasePrice: '', sellingPrice: '', purchaseDate: '', notes: '',
  });
  const [creditSaleSaving, setCreditSaleSaving] = useState(false);
  const [creditSaleError, setCreditSaleError]   = useState('');
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPaymentForm, setNewPaymentForm] = useState({ amount: '', paymentDate: '', notes: '' });
  const [paymentSaving, setPaymentSaving]   = useState(false);
  const [paymentError, setPaymentError]     = useState('');
  const [productPickerOpen, setProductPickerOpen]   = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const productPickerRef = React.useRef<HTMLDivElement>(null);
  const [quickAddCustomer, setQuickAddCustomer] = useState(false);

  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (productPickerRef.current && !productPickerRef.current.contains(e.target as Node)) setProductPickerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fetchCreditSales = async (customerId?: string) => {
    setCreditSalesLoading(true);
    try {
      const qs = customerId ? `?customerId=${customerId}` : '';
      const res = await fetch(`${API}/api/creditsales${qs}`);
      if (res.ok) setCreditSales(await res.json());
    } catch { /* silencioso */ }
    finally { setCreditSalesLoading(false); }
  };

  const fetchCreditSaleDetail = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/creditsales/${id}`);
      if (res.ok) setSelectedCreditSale(await res.json());
    } catch { /* silencioso */ }
  };

  const fetchCreditStats = async () => {
    try {
      const res = await fetch(`${API}/api/creditsales/summary`);
      if (res.ok) setCreditStats(await res.json());
    } catch { /* silencioso */ }
  };

  const handleCreateCreditSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreditSaleSaving(true); setCreditSaleError('');
    try {
      const res = await fetch(`${API}/api/creditsales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: newCreditSaleForm.productId,
          customerId: newCreditSaleForm.customerId,
          purchasePrice: Number(newCreditSaleForm.purchasePrice) || 0,
          sellingPrice: Number(newCreditSaleForm.sellingPrice) || 0,
          purchaseDate: newCreditSaleForm.purchaseDate || null,
          notes: newCreditSaleForm.notes,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || 'Error al registrar la compra.'); }
      setShowNewCreditSaleModal(false);
      setNewCreditSaleForm({ productId: '', customerId: '', purchasePrice: '', sellingPrice: '', purchaseDate: '', notes: '' });
      await Promise.all([fetchCreditSales(creditCustomerFilter || undefined), fetchCreditStats()]);
    } catch (err: any) {
      setCreditSaleError(err.message || 'Error al registrar la compra.');
    } finally {
      setCreditSaleSaving(false);
    }
  };

  const handleDeleteCreditSale = async (id: string) => {
    if (!confirm('¿Eliminar esta venta a crédito? Se borrarán también sus abonos.')) return;
    try {
      await fetch(`${API}/api/creditsales/${id}`, { method: 'DELETE' });
      if (selectedCreditSale?.id === id) setSelectedCreditSale(null);
      await Promise.all([fetchCreditSales(creditCustomerFilter || undefined), fetchCreditStats()]);
    } catch { /* silencioso */ }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    if (!selectedCreditSale) return;
    e.preventDefault();
    setPaymentSaving(true); setPaymentError('');
    try {
      const res = await fetch(`${API}/api/creditsales/${selectedCreditSale.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(newPaymentForm.amount) || 0,
          paymentDate: newPaymentForm.paymentDate || null,
          notes: newPaymentForm.notes || null,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || 'Error al agregar el abono.'); }
      setSelectedCreditSale(await res.json());
      setShowAddPaymentModal(false);
      setNewPaymentForm({ amount: '', paymentDate: '', notes: '' });
      await Promise.all([fetchCreditSales(creditCustomerFilter || undefined), fetchCreditStats()]);
    } catch (err: any) {
      setPaymentError(err.message || 'Error al agregar el abono.');
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!selectedCreditSale) return;
    if (!confirm('¿Eliminar este abono?')) return;
    try {
      await fetch(`${API}/api/creditsales/${selectedCreditSale.id}/payments/${paymentId}`, { method: 'DELETE' });
      await fetchCreditSaleDetail(selectedCreditSale.id);
      await Promise.all([fetchCreditSales(creditCustomerFilter || undefined), fetchCreditStats()]);
    } catch { /* silencioso */ }
  };

  // ── Product form state ─────────────────────────────────────────────────
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState('');

  const [npCatId,     setNpCatId]     = useState('');
  const [npBrandId,   setNpBrandId]   = useState('');
  const [npTypeId,    setNpTypeId]    = useState('');
  const [npSubTypeId, setNpSubTypeId] = useState('');

  const npBrandsForCat  = categories.find(c => c.id === npCatId)?.brands ?? [];
  const npTypesForBrand = npBrandsForCat.find(b => b.id === npBrandId)?.types ?? [];
  const npSubTypes      = npTypesForBrand.find(t => t.id === npTypeId)?.subTypes ?? [];

  const [npImageFiles,    setNpImageFiles]    = useState<File[]>([]);
  const [npImagePreviews, setNpImagePreviews] = useState<string[]>([]);

  const [npForm, setNpForm] = useState({
    name: '', description: '', detailedDescription: '',
    components: '', manufacturer: '', measurements: '', materials: '',
    color: '', shape: '', design: '', occasion: '', size: '', capacity: '',
    sellingPrice: '', discountPercentage: '0',
  });

  const handleNpFieldChange = (field: string, value: string) =>
    setNpForm(prev => ({ ...prev, [field]: value }));

  const handleNpImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const combined = [...npImageFiles, ...files].slice(0, 5);
    setNpImageFiles(combined);
    setNpImagePreviews(combined.map(f => URL.createObjectURL(f)));
  };

  const removeNpImage = (index: number) => {
    URL.revokeObjectURL(npImagePreviews[index]);
    const next = npImageFiles.filter((_, i) => i !== index);
    setNpImageFiles(next);
    setNpImagePreviews(next.map(f => URL.createObjectURL(f)));
  };

  // ── Product Detail & Edit ─────────────────────────────────────────────
  const [detailProduct, setDetailProduct] = useState<ApiProduct | null>(null);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [editForm, setEditForm] = useState({
    name: '', description: '', detailedDescription: '',
    components: '', manufacturer: '', measurements: '', materials: '',
    color: '', shape: '', design: '', occasion: '', size: '', capacity: '',
    sellingPrice: '', discountPercentage: '0',
  });
  const [editCatId,     setEditCatId]     = useState('');
  const [editBrandId,   setEditBrandId]   = useState('');
  const [editTypeId,    setEditTypeId]    = useState('');
  const [editSubTypeId, setEditSubTypeId] = useState('');
  const [editSaving,    setEditSaving]    = useState(false);
  const [editError,     setEditError]     = useState('');
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [editImageFiles,    setEditImageFiles]    = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [editProductPLItems, setEditProductPLItems] = useState<ProductPriceListItem[]>([]);
  const [editProductPLForms, setEditProductPLForms] = useState<Record<string, { purchasePrice: string; sellingPrice: string; discountPercent: string }>>({});
  const [editProductPLLoading, setEditProductPLLoading] = useState(false);
  const [variantSearch, setVariantSearch] = useState('');
  const [variantBrandFilter, setVariantBrandFilter] = useState('');
  const [variantTypeFilter, setVariantTypeFilter] = useState('');
  const [variantSavingId, setVariantSavingId] = useState<string | null>(null);

  const linkVariant = async (targetId: string) => {
    if (!editingProduct) return;
    setVariantSavingId(targetId);
    try {
      const res = await fetch(`${API}/api/variantgroup/${editingProduct.id}/link`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkToProductId: targetId }),
      });
      if (res.ok) {
        const listRes = await fetch(`${API}/api/products`);
        if (listRes.ok) {
          const list: ApiProduct[] = await listRes.json();
          setProducts(list);
          const updated = list.find(p => p.id === editingProduct.id);
          if (updated) setEditingProduct(updated);
        }
      }
    } catch { /* silencioso */ }
    finally { setVariantSavingId(null); }
  };

  const unlinkVariant = async (variantId: string) => {
    if (!editingProduct) return;
    setVariantSavingId(variantId);
    try {
      const res = await fetch(`${API}/api/variantgroup/${variantId}/unlink`, { method: 'PATCH' });
      if (res.ok) {
        const listRes = await fetch(`${API}/api/products`);
        if (listRes.ok) {
          const list: ApiProduct[] = await listRes.json();
          setProducts(list);
          const updated = list.find(p => p.id === editingProduct.id);
          if (updated) setEditingProduct(updated);
        }
      }
    } catch { /* silencioso */ }
    finally { setVariantSavingId(null); }
  };

  const openEditProduct = async (p: ApiProduct) => {
    setEditingProduct(p);
    setEditForm({
      name: p.name, description: p.description ?? '',
      detailedDescription: (p as any).detailedDescription ?? '',
      components: (p as any).components ?? '',
      manufacturer: p.manufacturer ?? '',
      measurements: (p as any).measurements ?? '',
      materials: (p as any).materials ?? '',
      color: (p as any).color ?? '',
      shape: (p as any).shape ?? '',
      design: (p as any).design ?? '',
      occasion: (p as any).occasion ?? '',
      size: (p as any).size ?? '',
      capacity: (p as any).capacity ?? '',
      sellingPrice: String(p.sellingPrice ?? ''),
      discountPercentage: String(p.discountPercentage ?? 0),
    });
    setEditCatId(p.categoryId ?? '');
    setEditBrandId(p.brandId ?? '');
    setEditTypeId(p.typeId ?? '');
    setEditSubTypeId((p as any).subTypeId ?? '');
    setEditExistingImages(p.images ?? []);
    setEditImageFiles([]);
    setEditImagePreviews([]);
    setEditError('');
    setEditProductPLItems([]);
    setEditProductPLForms({});
    setEditProductPLLoading(true);
    setVariantSearch('');
    setVariantBrandFilter('');
    setVariantTypeFilter('');
    // Cargar imágenes frescas desde la API (bypass caché del listado)
    fetch(`${API}/api/products/${p.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(fresh => { if (fresh?.images) setEditExistingImages(fresh.images); })
      .catch(() => {});
    try {
      const res = await fetch(`${API}/api/pricelists/product/${p.id}`);
      if (res.ok) {
        const items: ProductPriceListItem[] = await res.json();
        setEditProductPLItems(items);
        const forms: Record<string, { purchasePrice: string; sellingPrice: string; discountPercent: string }> = {};
        items.forEach(item => {
          forms[item.itemId] = {
            purchasePrice: String(item.purchasePrice),
            sellingPrice: String(item.sellingPrice),
            discountPercent: String(item.discountPercent),
          };
        });
        setEditProductPLForms(forms);
        // Sincronizar el precio público del producto con el primer item de lista de precios
        if (items.length > 0) {
          setEditForm(prev => ({ ...prev, sellingPrice: String(items[0].sellingPrice) }));
        }
      }
    } finally {
      setEditProductPLLoading(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditSaving(true); setEditError('');
    try {
      let newUrls: string[] = [];
      if (editImageFiles.length > 0) {
        const fd = new FormData();
        editImageFiles.forEach(f => fd.append('files', f));
        const upRes = await fetch(`${API}/api/uploads/products`, { method: 'POST', body: fd });
        if (!upRes.ok) throw new Error('Error al subir imágenes.');
        const upData = await upRes.json();
        newUrls = upData.paths as string[];
      }
      const finalImages = [...editExistingImages, ...newUrls];

      const res = await fetch(`${API}/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          sellingPrice: Number(editForm.sellingPrice) || 0,
          discountPercentage: Number(editForm.discountPercentage) || 0,
          categoryId: editCatId,
          brandId: editBrandId || null,
          typeId: editTypeId || null,
          subTypeId: editSubTypeId || null,
          images: finalImages,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || d.inner || d.message || 'Error al actualizar.'); }
      const updated = await res.json();
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));

      // Actualizar los items de listas de precios vinculados a este producto
      await Promise.all(
        editProductPLItems.map(item => {
          const form = editProductPLForms[item.itemId];
          if (!form) return Promise.resolve();
          return fetch(`${API}/api/pricelists/${item.priceListId}/items/${item.itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              characteristic: item.characteristic,
              purchasePrice: Number(form.purchasePrice) || 0,
              sellingPrice: Number(form.sellingPrice) || 0,
              discountPercent: Number(form.discountPercent) || 0,
            }),
          });
        })
      );

      editImagePreviews.forEach(url => URL.revokeObjectURL(url));
      setEditImageFiles([]);
      setEditImagePreviews([]);
      setEditExistingImages([]);
      setEditingProduct(null);
      fetchProducts();
      invalidateCatalog();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Error desconocido.');
    } finally {
      setEditSaving(false);
    }
  };

  const editBrandsForCat  = categories.find(c => c.id === editCatId)?.brands ?? [];
  const editTypesForBrand = editBrandsForCat.find(b => b.id === editBrandId)?.types ?? [];
  const editSubTypes      = editTypesForBrand.find(t => t.id === editTypeId)?.subTypes ?? [];

  const closeProductModal = () => {
    setShowProductModal(false);
    setProductError('');
    npImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setNpImageFiles([]);
    setNpImagePreviews([]);
    setNpCatId(''); setNpBrandId(''); setNpTypeId(''); setNpSubTypeId('');
    setNpForm({
      name: '', description: '', detailedDescription: '',
      components: '', manufacturer: '', measurements: '', materials: '',
      color: '', shape: '', design: '', occasion: '', size: '', capacity: '',
      sellingPrice: '', discountPercentage: '0',
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!npCatId) { setProductError('Selecciona una categoría.'); return; }
    setProductError('');
    setProductSaving(true);
    try {
      let paths: string[] = [];
      if (npImageFiles.length > 0) {
        const fd = new FormData();
        npImageFiles.forEach(f => fd.append('files', f));
        const upRes = await fetch(`${API}/api/uploads/products`, { method: 'POST', body: fd });
        if (!upRes.ok) throw new Error('Error al subir imágenes.');
        const upData = await upRes.json();
        paths = upData.paths as string[];
      }
      const body = {
        name: npForm.name, description: npForm.description,
        detailedDescription: npForm.detailedDescription, components: npForm.components,
        manufacturer: npForm.manufacturer, measurements: npForm.measurements,
        materials: npForm.materials, color: npForm.color, shape: npForm.shape,
        design: npForm.design, occasion: npForm.occasion, size: npForm.size,
        capacity: npForm.capacity, categoryId: npCatId,
        brandId: npBrandId || null, typeId: npTypeId || null, subTypeId: npSubTypeId || null,
        images: paths,
        sellingPrice: Number(npForm.sellingPrice) || 0,
        discountPercentage: Number(npForm.discountPercentage) || 0,
      };
      const res = await fetch(`${API}/api/products`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error al guardar el producto.');
      await fetchProducts();
      closeProductModal();
    } catch (err: unknown) {
      setProductError(err instanceof Error ? err.message : 'Error desconocido.');
    } finally {
      setProductSaving(false);
    }
  };

  // Modal states for Categories Restructured
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [showSubTypeModal, setShowSubTypeModal] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [newSubTypeName, setNewSubTypeName] = useState('');
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDesc, setEditCategoryDesc] = useState('');

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await fetch(`${API}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName.trim(), description: newCategoryDesc.trim() }),
    });
    setShowCategoryModal(false);
    setNewCategoryName('');
    setNewCategoryDesc('');
    fetchCategories();
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim() || !selectedCategoryId) return;
    await fetch(`${API}/api/categories/${selectedCategoryId}/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBrandName.trim() }),
    });
    setShowBrandModal(false);
    setNewBrandName('');
    setSelectedCategoryId(null);
    fetchCategories();
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim() || !selectedCategoryId || !selectedBrandId) return;
    await fetch(`${API}/api/categories/${selectedCategoryId}/brands/${selectedBrandId}/types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTypeName.trim() }),
    });
    setShowTypeModal(false);
    setNewTypeName('');
    setSelectedCategoryId(null);
    setSelectedBrandId(null);
    fetchCategories();
  };

  const handleAddSubType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTypeName.trim() || !selectedCategoryId || !selectedBrandId || !selectedTypeId) return;
    await fetch(`${API}/api/categories/${selectedCategoryId}/brands/${selectedBrandId}/types/${selectedTypeId}/subtypes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSubTypeName.trim() }),
    });
    setShowSubTypeModal(false);
    setNewSubTypeName('');
    setSelectedTypeId(null);
    fetchCategories();
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCategoryName.trim()) return;
    await fetch(`${API}/api/categories/${editingCategory.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editCategoryName.trim(), description: editCategoryDesc.trim() }),
    });
    setEditingCategory(null);
    fetchCategories();
  };

  // --- Shipping modal state ---
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [pendingShipOrderId, setPendingShipOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [carrierInput, setCarrierInput] = useState('');

  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (newStatus === 'Enviado') {
      setPendingShipOrderId(orderId);
      setTrackingInput('');
      setCarrierInput(carriers.find(c => c.isActive)?.name ?? '');
      setShowShippingModal(true);
      return;
    }
    applyStatusChange(orderId, newStatus, null, null);
  };

  const applyStatusChange = async (orderId: string, newStatus: string, tracking: string | null, carrier: string | null) => {
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, trackingNumber: tracking, carrier }),
      });
      if (res.ok) {
        const updated: ApiOrder = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder(updated);
      }
    } catch { /* silencioso */ }
  };

  const confirmShipping = async () => {
    if (!pendingShipOrderId || !trackingInput.trim()) return;
    await applyStatusChange(pendingShipOrderId, 'Enviado', trackingInput.trim(), carrierInput);
    setShowShippingModal(false);
    setPendingShipOrderId(null);
  };

  const cancelShipping = () => {
    setShowShippingModal(false);
    setPendingShipOrderId(null);
  };

  const fetchPriceLists = async () => {
    setPriceListLoading(true);
    try {
      const res = await fetch(`${API}/api/pricelists`);
      if (res.ok) setPriceLists(await res.json());
    } finally {
      setPriceListLoading(false);
    }
  };

  const fetchPriceListDetail = async (id: string) => {
    const res = await fetch(`${API}/api/pricelists/${id}`);
    if (res.ok) setSelectedPriceList(await res.json());
  };

  const handleCreatePriceList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPLName.trim()) return;
    setPlSaving(true);
    try {
      const res = await fetch(`${API}/api/pricelists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPLName, description: newPLDesc }),
      });
      if (res.ok) {
        setShowNewPriceListModal(false);
        setNewPLName(''); setNewPLDesc('');
        await fetchPriceLists();
      }
    } finally {
      setPlSaving(false);
    }
  };

  const handleAddPriceListItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPriceList || !itemForm.productId) { setItemError('Selecciona un producto.'); return; }
    setItemError('');
    setItemSaving(true);
    try {
      const res = await fetch(`${API}/api/pricelists/${selectedPriceList.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: itemForm.productId,
          characteristic: itemForm.characteristic,
          purchasePrice: Number(itemForm.purchasePrice) || 0,
          sellingPrice: Number(itemForm.sellingPrice) || 0,
          discountPercent: Number(itemForm.discountPercent) || 0,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error'); }
      setShowAddItemModal(false);
      setItemForm({ productId: '', characteristic: '', purchasePrice: '', sellingPrice: '', discountPercent: '0' });
      await fetchPriceListDetail(selectedPriceList.id);
    } catch (err: unknown) {
      setItemError(err instanceof Error ? err.message : 'Error');
    } finally {
      setItemSaving(false);
    }
  };

  const handleDeletePriceListItem = async (itemId: string) => {
    if (!selectedPriceList) return;
    await fetch(`${API}/api/pricelists/${selectedPriceList.id}/items/${itemId}`, { method: 'DELETE' });
    await fetchPriceListDetail(selectedPriceList.id);
  };

  const openEditItem = (item: PriceListItem) => {
    setEditingItem(item);
    setPlItemEditForm({
      characteristic:  item.characteristic,
      purchasePrice:   String(item.purchasePrice),
      sellingPrice:    String(item.sellingPrice),
      discountPercent: String(item.discountPercent),
    });
    setPlItemEditError('');
  };

  const handleUpdatePriceListItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPriceList || !editingItem) return;
    setPlItemEditError('');
    setPlItemEditSaving(true);
    try {
      const res = await fetch(`${API}/api/pricelists/${selectedPriceList.id}/items/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characteristic:  plItemEditForm.characteristic,
          purchasePrice:   Number(plItemEditForm.purchasePrice) || 0,
          sellingPrice:    Number(plItemEditForm.sellingPrice)  || 0,
          discountPercent: Number(plItemEditForm.discountPercent) || 0,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error al actualizar'); }

      // Sincronizar sellingPrice del producto con el precio de la lista de precios
      const newSellingPrice = Number(plItemEditForm.sellingPrice) || 0;
      const product = products.find(pr => pr.id === editingItem.productId);
      if (product && product.sellingPrice !== newSellingPrice) {
        await fetch(`${API}/api/products/${editingItem.productId}/price`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSellingPrice),
        });
        setProducts(prev => prev.map(pr => pr.id === product.id ? { ...pr, sellingPrice: newSellingPrice } : pr));
      }

      invalidateCatalog();
      setEditingItem(null);
      await fetchPriceListDetail(selectedPriceList.id);
    } catch (err: unknown) {
      setPlItemEditError(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setPlItemEditSaving(false);
    }
  };

  const handleDeletePriceList = async (id: string) => {
    await fetch(`${API}/api/pricelists/${id}`, { method: 'DELETE' });
    if (selectedPriceList?.id === id) setSelectedPriceList(null);
    await fetchPriceLists();
  };

  React.useEffect(() => { fetchProducts(); fetchCategories(); fetchInventory(); fetchPriceLists(); fetchClients(); fetchOrders(); fetchCarriers(); fetchAllOrders(); fetchCreditSales(); fetchCreditStats(); }, []);

  // Re-fetch pedidos al entrar a la pestaña
  React.useEffect(() => {
    if (activeTab === 'orders') fetchOrders(orderStatusFilter, orderSearch);
  }, [activeTab]);

  // Auto-refresh cada 30 segundos cuando la pestaña de pedidos está activa
  React.useEffect(() => {
    if (activeTab !== 'orders') return;
    const timer = setInterval(() => fetchOrders(orderStatusFilter, orderSearch), 30000);
    return () => clearInterval(timer);
  }, [activeTab, orderStatusFilter, orderSearch]);

  const getStatusColor = (status: string) =>
    STATUS_CONFIG[status]?.color ?? 'bg-yellow-100 text-yellow-800 border-yellow-200';

  return (
    <div className="flex bg-slate-50 relative" style={{ minHeight: 'calc(100vh - 4rem)' }}>

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className={`fixed left-0 top-16 w-64 bg-slate-900 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto z-40 transition-transform duration-300 ${ sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="px-5 pt-7 pb-5 border-b border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OriginAXM</p>
          <p className="text-xs text-slate-300 font-semibold mt-0.5">Panel de Administración</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {([
            { id: 'dashboard',  Icon: TrendingUp,    label: 'Dashboard'     },
            { id: 'orders',     Icon: ClipboardList, label: 'Pedidos'       },
            { id: 'products',   Icon: Package,       label: 'Productos'     },
            { id: 'inventory',  Icon: BarChart3,     label: 'Inventario'    },
            { id: 'pricelists',  Icon: DollarSign,    label: 'Lista de Precios' },
            { id: 'gastos',      Icon: Wallet,        label: 'Gastos'           },
            { id: 'categories',    Icon: Tag,           label: 'Categorías'      },
            { id: 'carriers',     Icon: Truck,         label: 'Transportadoras' },
            { id: 'users',        Icon: Users,         label: 'Clientes'        },
            { id: 'recommended',  Icon: Star,          label: 'Recomendados'    },
            { id: 'featured',     Icon: TrendingUp,    label: 'Destacados'      },
            { id: 'international', Icon: Globe,        label: 'Internacionales' },
            { id: 'reports',      Icon: FileBarChart2, label: 'Informes'        },
            { id: 'settings',     Icon: Settings,      label: 'Configuración'   },
          ] as { id: string; Icon: React.ElementType; label: string }[]).map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSelectedOrder(null); setSelectedCreditSale(null); setSidebarOpen(false); }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                activeTab === id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{fullName}</p>
              <p className="text-[10px] text-slate-500 truncate">{email}</p>
            </div>
            <button onClick={logout} title="Cerrar sesión" className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main ──────────────────────────────────────────────────── */}
      <div className="md:ml-64 flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-lg font-bold text-slate-800 truncate">
              {activeTab === 'dashboard'  && 'Dashboard'}
              {activeTab === 'orders'     && (selectedOrder ? `Pedido ${selectedOrder.orderNumber}` : 'Gestión de Pedidos')}
              {activeTab === 'products'   && 'Gestión de Productos'}
              {activeTab === 'categories' && 'Gestión de Categorías'}
              {activeTab === 'inventory'    && 'Inventario de Productos'}
              {activeTab === 'carriers'     && 'Transportadoras'}
              {activeTab === 'users'        && 'Clientes'}
              {activeTab === 'recommended'  && 'Productos Recomendados'}
              {activeTab === 'featured'     && 'Novedades Destacadas'}
              {activeTab === 'international' && 'Productos Internacionales'}
              {activeTab === 'gastos'       && (selectedCreditSale ? selectedCreditSale.productName : 'Compras a Crédito')}
              {activeTab === 'reports'      && 'Informes'}
              {activeTab === 'settings'     && 'Configuración'}
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">OriginAXM · Panel de administración</p>
          </div>
          <span className="text-xs text-slate-400 hidden lg:block capitalize flex-shrink-0">
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pt-6 pb-10">
          {activeTab === 'orders' ? (
            <div>
              {selectedOrder ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelectedOrder(null)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 stroke-[2]" />
                      </button>
                      <h1 className="text-2xl font-extrabold text-black">Detalles del Pedido {selectedOrder.orderNumber}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Estado:</span>
                      <select 
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                        className={`text-sm font-bold px-4 py-2 rounded-sm border focus:outline-none focus:ring-2 focus:ring-black cursor-pointer ${getStatusColor(selectedOrder.status)}`}
                      >
                        {ORDER_STATUSES.map(status => (
                          <option key={status} value={status} className="bg-white text-black">{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      {/* Productos */}
                      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                          <h3 className="text-lg font-bold text-black">Productos</h3>
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            {selectedOrder.items.reduce((s: number, i: ApiOrderItem) => s + i.quantity, 0)} unidades
                          </span>
                        </div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400">
                              <th className="px-6 py-2 text-left">Producto</th>
                              <th className="px-4 py-2 text-center">Cant.</th>
                              <th className="px-4 py-2 text-right">Precio unit.</th>
                              <th className="px-6 py-2 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.items.map((item: ApiOrderItem) => (
                              <tr key={item.id} className="border-t border-gray-50">
                                <td className="px-6 py-3">
                                  <p className="font-bold text-black">{item.productName}</p>
                                  {item.productCode && <p className="text-xs text-gray-400 font-mono mt-0.5">#{item.productCode}</p>}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full font-bold text-gray-700">{item.quantity}</span>
                                </td>
                                <td className="px-4 py-3 text-right text-gray-600">${item.unitPrice.toLocaleString('es-CL')}</td>
                                <td className="px-6 py-3 text-right font-bold text-black">${item.subtotal.toLocaleString('es-CL')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {/* Desglose totales */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal productos</span>
                            <span>${selectedOrder.items.reduce((s: number, i: ApiOrderItem) => s + i.subtotal, 0).toLocaleString('es-CL')}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Envío</span>
                            {selectedOrder.totalAmount - selectedOrder.items.reduce((s: number, i: ApiOrderItem) => s + i.subtotal, 0) === 0
                              ? <span className="text-green-600 font-bold">Gratis</span>
                              : <span>${(selectedOrder.totalAmount - selectedOrder.items.reduce((s: number, i: ApiOrderItem) => s + i.subtotal, 0)).toLocaleString('es-CL')}</span>
                            }
                          </div>
                          <div className="flex justify-between font-extrabold text-lg text-black pt-2 border-t border-gray-200">
                            <span>Total</span>
                            <span>${selectedOrder.totalAmount.toLocaleString('es-CL')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Notas del pedido */}
                      {selectedOrder.notes && (
                        <div className="bg-amber-50 border border-amber-200 rounded-sm p-4">
                          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Notas del pedido</p>
                          <p className="text-sm text-amber-900">{selectedOrder.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-black border-b border-gray-100 pb-3 mb-4">Información del Cliente</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Documento</p>
                            <p className="font-mono text-sm text-black">{selectedOrder.customerDocument || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre</p>
                            <p className="font-medium text-black">{selectedOrder.customerName}</p>
                          </div>
                          {selectedOrder.customerEmail && (
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Correo</p>
                              <a href={`mailto:${selectedOrder.customerEmail}`} className="text-sm text-blue-600 hover:underline">{selectedOrder.customerEmail}</a>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Teléfono</p>
                            <div className="flex items-center gap-3">
                              <p className="font-medium text-black">{selectedOrder.customerPhone}</p>
                              <a
                                href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold px-2.5 py-1 rounded-sm transition-colors"
                              >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                WhatsApp
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-black border-b border-gray-100 pb-3 mb-4">Dirección de Envío</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dirección</p>
                            <p className="font-medium text-black">{selectedOrder.customerAddress || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ciudad</p>
                            <p className="font-medium text-black">{selectedOrder.customerCity || '—'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Fecha y hora del pedido */}
                      <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-black border-b border-gray-100 pb-3 mb-4">Fecha del Pedido</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha</p>
                            <p className="font-medium text-black">{new Date(selectedOrder.orderDate).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hora</p>
                            <p className="font-medium text-black">{new Date(selectedOrder.orderDate).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </div>

                      {/* Card Referencia de Pago — visible si existe */}
                      {selectedOrder.referenceCode && (
                        <div className="bg-amber-50 p-6 rounded-sm shadow-sm border border-amber-200">
                          <h3 className="text-lg font-bold text-amber-900 border-b border-amber-200 pb-3 mb-4">Referencia de Pago</h3>
                          <div className="space-y-4">
                            {selectedOrder.paymentMethod && (
                              <div>
                                <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Método de Pago</p>
                                <p className="font-bold text-amber-900">{selectedOrder.paymentMethod}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Código de Referencia</p>
                              <p className="font-mono font-bold text-amber-900 text-lg tracking-widest">{selectedOrder.referenceCode}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Card Guía de Envío — visible si tiene tracking */}
                      {selectedOrder.trackingNumber ? (
                        <div className="bg-sky-50 p-6 rounded-sm shadow-sm border border-sky-200">
                          <h3 className="text-lg font-bold text-sky-900 border-b border-sky-200 pb-3 mb-4">Guía de Envío</h3>
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-1">Transportadora</p>
                              <p className="font-bold text-sky-900">{selectedOrder.carrier}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-1">Número de Guía</p>
                              <p className="font-mono font-bold text-sky-900 text-lg tracking-widest">{selectedOrder.trackingNumber}</p>
                            </div>
                          </div>
                        </div>
                      ) : (selectedOrder.status !== 'Cancelado' && (
                        <div className="bg-gray-50 p-4 rounded-sm border border-dashed border-gray-200 text-center">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Sin guía asignada</p>
                          <p className="text-xs text-gray-400 mt-1">Se generará al cambiar el estado a <span className="font-bold text-sky-600">Enviado</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                    <h1 className="text-2xl font-extrabold text-black">Gestión de Pedidos</h1>
                    <button onClick={() => fetchOrders(orderStatusFilter, orderSearch)} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 rounded-sm transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                    </button>
                  </div>

                  {/* Filtros */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Buscar por cliente, teléfono, N° pedido..."
                      value={orderSearch}
                      onChange={e => { setOrderSearch(e.target.value); fetchOrders(orderStatusFilter, e.target.value); }}
                      className="flex-1 min-w-[200px] text-sm border border-gray-200 rounded-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <select
                      value={orderStatusFilter}
                      onChange={e => { setOrderStatusFilter(e.target.value); fetchOrders(e.target.value, orderSearch); }}
                      className="text-sm border border-gray-200 rounded-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="">Todos los estados</option>
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Stats rápidas */}
                  {orders.length > 0 && (() => {
                    const totalItems   = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0);
                    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
                    const activos      = orders.filter(o => o.status !== 'Entregado' && o.status !== 'Cancelado').length;
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                        <div className="bg-white border border-gray-100 rounded-sm p-4 shadow-sm">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pedidos</p>
                          <p className="text-2xl font-extrabold text-black">{orders.length}</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-sm p-4 shadow-sm">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Productos Vendidos</p>
                          <p className="text-2xl font-extrabold text-black">{totalItems}</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-sm p-4 shadow-sm">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ingresos</p>
                          <p className="text-2xl font-extrabold text-black">${totalRevenue.toLocaleString('es-CL')}</p>
                        </div>
                        <div className="bg-white border border-yellow-100 rounded-sm p-4 shadow-sm">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">En Proceso</p>
                          <p className="text-2xl font-extrabold text-yellow-600">{activos}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Leyenda de estados */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {Object.values(STATUS_CONFIG).map(s => (
                      <span key={s.label} className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-sm border ${s.color}`}>
                        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    ))}
                  </div>

                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando pedidos...
                    </div>
                  ) : ordersError ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {ordersError}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-sm text-gray-400">
                      <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No hay pedidos registrados.</p>
                    </div>
                  ) : (
                  <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[640px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="p-3 md:p-4 font-semibold text-gray-600 text-sm">N° Pedido</th>
                          <th className="p-3 md:p-4 font-semibold text-gray-600 text-sm">Fecha</th>
                          <th className="p-3 md:p-4 font-semibold text-gray-600 text-sm">Cliente</th>
                          <th className="p-3 md:p-4 font-semibold text-gray-600 text-sm">Estado</th>
                          <th className="p-3 md:p-4 font-semibold text-gray-600 text-sm">Total</th>
                          <th className="p-3 md:p-4 font-semibold text-gray-600 text-sm text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-bold text-black whitespace-nowrap">{order.orderNumber}</td>
                            <td className="p-4 text-gray-600 whitespace-nowrap">{new Date(order.orderDate).toLocaleDateString('es-CO')}</td>
                            <td className="p-4">
                              <div className="space-y-0.5">
                                {order.customerDocument && <p className="text-xs text-gray-400 font-mono">{order.customerDocument}</p>}
                                <p className="font-bold text-black text-sm">{order.customerName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">{order.customerPhone}</span>
                                  {order.customerPhone && (
                                  <a
                                    href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#128C7E] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm transition-colors"
                                  >
                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    WA
                                  </a>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="inline-block relative">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  className={`appearance-none px-3 py-1 pr-8 text-xs font-bold rounded-sm border cursor-pointer focus:outline-none focus:ring-1 focus:ring-black ${getStatusColor(order.status)}`}
                                >
                                  {ORDER_STATUSES.map(status => (
                                    <option key={status} value={status} className="bg-white text-black">{status}</option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-bold text-black whitespace-nowrap">${order.totalAmount.toLocaleString('es-CL')}</td>
                            <td className="p-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="p-2 text-gray-400 hover:text-black transition-colors"
                                  title="Ver Detalles"
                                >
                                  <Eye className="w-4 h-4 stroke-[1.5]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  )}
                </>
              )}
            </div>
          ) : activeTab === 'products' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-extrabold text-black">Gestión de Productos</h1>
                <button 
                  onClick={() => setShowProductModal(true)}
                  className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-bold uppercase tracking-wider py-2 px-4 rounded-full transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[1.5]" /> Nuevo Producto
                </button>
              </div>

              {productsLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando productos...
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-sm text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay productos. Crea el primero con el botón de arriba.</p>
                </div>
              ) : (
                <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-4 md:px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Código</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Categoría / Marca</th>
                        <th className="px-4 md:px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 md:px-6 py-3">
                            <div className="flex items-center gap-3">
                              {/* Imagen portrait */}
                              <div className="w-10 h-[3.5rem] flex-shrink-0 rounded-sm border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                {product.images?.[0] ? (
                                  <img
                                    src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5173${product.images[0]}`}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-0.5"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  />
                                ) : (
                                  <Package className="w-4 h-4 text-gray-300" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-black leading-tight">{product.name}</p>
                                {product.manufacturer && <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">{product.manufacturer}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-sm tracking-widest">
                              #{product.productCode || '——'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold text-gray-600">{categories.find(c => c.id === product.categoryId)?.name || '—'}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setDetailProduct(product)}
                                className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
                                title="Ver Detalle">
                                Ver
                              </button>
                              <button
                                onClick={() => openEditProduct(product)}
                                className="p-1.5 text-gray-400 hover:text-black transition-colors" title="Editar">
                                <Edit className="w-4 h-4 stroke-[1.5]" />
                              </button>
                              <button
                                onClick={async () => {
                                  await fetch(`${API}/api/products/${product.id}`, { method: 'DELETE' });
                                  await fetchProducts();
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
                                <Trash2 className="w-4 h-4 stroke-[1.5]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === 'categories' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">Gestiona categorías, marcas y tipos de producto.</p>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" /> Nueva Categoría
                </button>
              </div>

              {catLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : categories.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
                  <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-500">No hay categorías registradas</p>
                  <p className="text-sm text-slate-400 mt-1">Crea la primera categoría con el botón de arriba.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map(category => (
                    <div key={category.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                      {/* Category header */}
                      <div className="px-6 py-4 flex justify-between items-center border-b border-slate-50 bg-slate-50">
                        <div>
                          <h2 className="text-base font-bold text-slate-800">{category.name}</h2>
                          {category.description && <p className="text-xs text-slate-500 mt-0.5">{category.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedCategoryId(category.id); setShowBrandModal(true); }}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Marca
                          </button>
                          <button
                            onClick={() => { setEditingCategory(category); setEditCategoryName(category.name); setEditCategoryDesc(category.description); }}
                            className="p-2 text-slate-300 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50"
                            title="Editar categoría"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              await fetch(`${API}/api/categories/${category.id}`, { method: 'DELETE' });
                              fetchCategories();
                            }}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Brands */}
                      <div className="p-6">
                        {category.brands.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Sin marcas. Agrega una con el botón + Marca.</p>
                        ) : (
                          <div className="space-y-4">
                            {category.brands.map(brand => (
                              <div key={brand.id} className="border border-slate-100 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">{brand.name}</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => { setSelectedCategoryId(category.id); setSelectedBrandId(brand.id); setShowTypeModal(true); }}
                                      className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-400 px-2.5 py-1 rounded-lg transition-colors"
                                    >
                                      <Plus className="w-3 h-3" /> Tipo
                                    </button>
                                    <button
                                      onClick={async () => {
                                        await fetch(`${API}/api/categories/${category.id}/brands/${brand.id}`, { method: 'DELETE' });
                                        fetchCategories();
                                      }}
                                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  {brand.types.length === 0 ? (
                                    <span className="text-xs text-slate-400 italic">Sin tipos.</span>
                                  ) : brand.types.map(type => (
                                    <div key={type.id} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                                      {/* Type header */}
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{type.name}</span>
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={() => { setSelectedCategoryId(category.id); setSelectedBrandId(brand.id); setSelectedTypeId(type.id); setShowSubTypeModal(true); }}
                                            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-400 px-2 py-0.5 rounded-md transition-colors"
                                          >
                                            <Plus className="w-2.5 h-2.5" /> SubTipo
                                          </button>
                                          <button
                                            onClick={async () => {
                                              await fetch(`${API}/api/categories/${category.id}/brands/${brand.id}/types/${type.id}`, { method: 'DELETE' });
                                              fetchCategories();
                                            }}
                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                      {/* SubTypes */}
                                      <div className="flex flex-wrap gap-1.5">
                                        {(type.subTypes ?? []).length === 0 ? (
                                          <span className="text-[11px] text-slate-400 italic">Sin subtipos. Ej: 30Oz, 40Oz</span>
                                        ) : (type.subTypes ?? []).map(sub => (
                                          <div key={sub.id} className="flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-full group hover:border-slate-300 transition-colors">
                                            <span className="text-[11px] font-medium text-slate-600">{sub.name}</span>
                                            <button
                                              onClick={async () => {
                                                await fetch(`${API}/api/categories/${category.id}/brands/${brand.id}/types/${type.id}/subtypes/${sub.id}`, { method: 'DELETE' });
                                                fetchCategories();
                                              }}
                                              className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                              <X className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'carriers' ? (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-black">Transportadoras</h1>
                  <p className="text-xs text-gray-400 mt-0.5">{carriers.length} transportadora{carriers.length !== 1 ? 's' : ''} registrada{carriers.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={openNewCarrier}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors uppercase tracking-wide">
                  <Plus className="w-4 h-4" /> Nueva Transportadora
                </button>
              </div>

              <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-x-auto">
                {carriersLoading ? (
                  <div className="flex items-center justify-center py-16 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando transportadoras...
                  </div>
                ) : carriers.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No hay transportadoras registradas.</p>
                    <p className="text-xs mt-1 text-gray-300">Crea la primera para poder asignarla a tus pedidos.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Nombre</th>
                        <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Contacto / Info</th>
                        <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3 text-center">Estado</th>
                        <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Registrada</th>
                        <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {carriers.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                                <Truck className="w-4 h-4 text-sky-500" />
                              </div>
                              <span className="font-semibold text-sm text-black">{c.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{c.contactInfo || '—'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {c.isActive ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEditCarrier(c)}
                                className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-sm transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteCarrier(c.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          ) : activeTab === 'users' ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-black">Clientes</h1>
                  <p className="text-xs text-gray-400 mt-0.5">{clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={openNewClient}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors uppercase tracking-wide">
                  <Plus className="w-4 h-4" /> Nuevo Cliente
                </button>
              </div>

              {/* Search */}
              <div className="relative max-w-sm">
                <input type="text" value={clientSearch}
                  onChange={e => { setClientSearch(e.target.value); fetchClients(e.target.value || undefined); }}
                  placeholder="Buscar por nombre, email, teléfono..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {/* Table */}
              <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-x-auto">
                {clientsLoading ? (
                  <div className="flex items-center justify-center py-16 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando clientes...
                  </div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No hay clientes registrados.</p>
                    <button onClick={openNewClient}
                      className="mt-3 text-black font-bold text-sm hover:underline">
                      Crear el primero
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[640px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-4 md:px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Contacto</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Dirección</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                        <th className="px-4 md:px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {clients.map(client => (
                        <tr key={client.id} className="hover:bg-gray-50 transition-colors text-sm">
                          <td className="px-4 md:px-6 py-3">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-black">{client.fullName}</p>
                              {client.username && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 rounded-sm">Con cuenta</span>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs">{client.username ? `@${client.username} · ` : ''}{client.email || '—'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 text-sm">{client.phone || '—'}</span>
                              {client.phone && (
                                <a href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="text-[#25D366] hover:text-[#128C7E] flex-shrink-0" title="Chat WhatsApp">
                                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                  </svg>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 max-w-[200px]">
                            <p className="truncate text-sm">{client.address ? `${client.address}${client.city ? `, ${client.city}` : ''}` : client.city || '—'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                              client.isActive
                                ? 'bg-green-50 text-green-700 border-green-100'
                                : 'bg-gray-50 text-gray-400 border-gray-100'
                            }`}>
                              {client.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-3">
                            <div className="flex justify-end items-center gap-1">
                              <button onClick={() => setDetailClient(client)}
                                className="p-1.5 text-gray-400 hover:text-black transition-colors" title="Ver detalle">
                                <Eye className="w-4 h-4 stroke-[1.5]" />
                              </button>
                              <button onClick={() => openEditClient(client)}
                                className="p-1.5 text-gray-400 hover:text-black transition-colors" title="Editar">
                                <Edit className="w-4 h-4 stroke-[1.5]" />
                              </button>
                              <button onClick={() => handleDeleteClient(client.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
                                <Trash2 className="w-4 h-4 stroke-[1.5]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : activeTab === 'inventory' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-black">Gestión de Inventario</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Control de stock y movimientos por producto.</p>
                </div>
                <button onClick={fetchInventory} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-sm text-sm font-medium hover:bg-gray-50">
                  <RefreshCw className="w-4 h-4" /> Actualizar
                </button>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-4">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Productos</p>
                  <p className="text-3xl font-extrabold text-emerald-700 mt-1">{inventoryProducts.length}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-sm p-4">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Stock Bajo (&lt; 5)</p>
                  <p className="text-3xl font-extrabold text-amber-700 mt-1">{inventoryProducts.filter(p => p.stock < 5).length}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-sm p-4">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Sin Stock</p>
                  <p className="text-3xl font-extrabold text-red-700 mt-1">{inventoryProducts.filter(p => p.stock === 0).length}</p>
                </div>
              </div>

              {/* Error */}
              {inventoryError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{inventoryError}
                </div>
              )}

              {/* Search */}
              {!inventoryError && (
                <div className="relative">
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={e => setInventorySearch(e.target.value)}
                    placeholder="Buscar por nombre de producto..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              )}

              {/* Products table */}
              <div className="bg-white border border-gray-100 rounded-sm shadow-sm">
                {inventoryLoading ? (
                  <div className="flex items-center justify-center py-16 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando inventario...
                  </div>
                ) : inventoryError ? null : (() => {
                  const filtered = inventoryProducts.filter(p =>
                    p.name.toLowerCase().includes(inventorySearch.toLowerCase())
                  );
                  return filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">
                        {inventorySearch ? `Sin resultados para "${inventorySearch}".` : 'No hay productos registrados en el sistema.'}
                      </p>
                      {!inventorySearch && (
                        <p className="text-xs mt-1 text-gray-300">Agrega productos en la sección Productos para verlos aquí.</p>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 md:px-6 py-3">Producto</th>
                            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Código</th>
                            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Categoría / Marca</th>
                            <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Stock</th>
                            <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3 text-emerald-600">Entradas</th>
                            <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3 text-red-500">Salidas</th>
                            <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Estado</th>
                            <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-4 md:px-6 py-3">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 md:px-6 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 flex-shrink-0 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                    {p.image ? (
                                      <img src={p.image.startsWith('http') ? p.image : `http://localhost:5173${p.image}`}
                                        alt={p.name} className="w-full h-full object-contain p-1"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                                    ) : (
                                      <Package className="w-5 h-5 text-gray-300" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-black">{p.name}</p>
                                    {p.manufacturer && <p className="text-xs text-gray-400">{p.manufacturer}</p>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-mono text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-sm tracking-widest">
                                  #{p.productCode || '——'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-xs text-gray-600">{p.categoryName}</p>
                                {p.brandName && <p className="text-xs text-gray-400">{p.brandName}</p>}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleQuickAdjust(p, 'Salida')}
                                    disabled={quickAdjustingId === p.id || p.stock <= 0}
                                    title="Restar 1 del stock"
                                    className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <span className="text-sm leading-none">−</span>
                                  </button>
                                  <span className="text-lg font-extrabold text-black w-7 text-center">
                                    {quickAdjustingId === p.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" /> : p.stock}
                                  </span>
                                  <button
                                    onClick={() => handleQuickAdjust(p, 'Entrada')}
                                    disabled={quickAdjustingId === p.id}
                                    title="Sumar 1 al stock"
                                    className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <span className="text-sm leading-none">+</span>
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-sm font-bold text-emerald-600">+{p.totalEntradas}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-sm font-bold text-red-500">-{p.totalSalidas}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {p.stock === 0 ? (
                                  <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">Sin stock</span>
                                ) : p.stock < 5 ? (
                                  <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Stock bajo</span>
                                ) : (
                                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">OK</span>
                                )}
                              </td>
                              <td className="px-4 md:px-6 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => openMovementModal(p)}
                                    className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-sm hover:bg-gray-800 transition-colors">
                                    + Movimiento
                                  </button>
                                  <button onClick={() => openHistoryModal(p)}
                                    className="px-3 py-1.5 border border-gray-200 text-xs font-bold rounded-sm hover:bg-gray-50 transition-colors">
                                    Historial
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>

          ) : activeTab === 'pricelists' ? (
            <div className="space-y-6">
              {!selectedPriceList ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold text-black">Listas de Precios</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Gestiona listas con precios, descuentos y márgenes.</p>
                    </div>
                    <button onClick={() => setShowNewPriceListModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-sm hover:bg-gray-800">
                      <Plus className="w-4 h-4" /> Nueva Lista
                    </button>
                  </div>

                  {priceListLoading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />Cargando...
                    </div>
                  ) : priceLists.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-sm text-gray-400">
                      <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No hay listas de precios. Crea la primera.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {priceLists.map(pl => (
                        <div key={pl.id} className="bg-white border border-gray-100 rounded-sm shadow-sm p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-extrabold text-black truncate">{pl.name}</h3>
                              {pl.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{pl.description}</p>}
                            </div>
                            <span className={`ml-2 flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${pl.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                              {pl.isActive ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-4">{pl.itemCount} producto{pl.itemCount !== 1 ? 's' : ''}</p>
                          <div className="flex gap-2">
                            <button onClick={() => fetchPriceListDetail(pl.id)}
                              className="flex-1 py-2 bg-black text-white text-xs font-bold rounded-sm hover:bg-gray-800">
                              Ver Detalle
                            </button>
                            <button onClick={() => handleDeletePriceList(pl.id)}
                              className="p-2 border border-gray-200 rounded-sm hover:bg-red-50 hover:border-red-200 transition-colors">
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedPriceList(null)}
                      className="p-2 border border-gray-200 rounded-sm hover:bg-gray-50">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-xl font-extrabold text-black">{selectedPriceList.name}</h2>
                      {selectedPriceList.description && <p className="text-sm text-gray-500">{selectedPriceList.description}</p>}
                    </div>
                    <button onClick={() => setShowAddItemModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-sm hover:bg-gray-800">
                      <Plus className="w-4 h-4" /> Agregar Producto
                    </button>
                  </div>

                  {selectedPriceList.items.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-sm text-gray-400">
                      <p className="text-sm">Esta lista no tiene productos. Agrega el primero.</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-x-auto">
                      <table className="w-full min-w-[820px]">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 md:px-6 py-3 w-56">Producto</th>
                            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3 w-28">Código</th>
                            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Característica</th>
                            <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">P. Compra</th>
                            <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">P. Venta</th>
                            <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Descuento</th>
                            <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">P. Final</th>
                            <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Margen</th>
                            <th className="px-4 md:px-6 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {selectedPriceList.items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 md:px-6 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-[3.5rem] flex-shrink-0 rounded-sm border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                    {item.productImage ? (
                                      <img
                                        src={item.productImage.startsWith('http') ? item.productImage : `http://localhost:5173${item.productImage}`}
                                        alt={item.productName}
                                        className="w-full h-full object-contain p-0.5"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                      />
                                    ) : (
                                      <Package className="w-4 h-4 text-gray-300" />
                                    )}
                                  </div>
                                  <span className="font-semibold text-sm text-black leading-tight">{item.productName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {item.productCode
                                  ? <span className="font-mono text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-sm tracking-widest">#{item.productCode}</span>
                                  : <span className="text-gray-300 text-xs">—</span>}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">{item.characteristic || '—'}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-600">${item.purchasePrice.toLocaleString('es-CL')}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-600">${item.sellingPrice.toLocaleString('es-CL')}</td>
                              <td className="px-4 py-3 text-center">
                                {item.discountPercent > 0 ? (
                                  <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                                    -{item.discountPercent}%
                                  </span>
                                ) : <span className="text-gray-300 text-xs">—</span>}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-sm text-black">${item.finalPrice.toLocaleString('es-CL')}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`text-sm font-bold ${item.marginPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {item.marginPercent}%
                                </span>
                              </td>
                              <td className="px-4 md:px-6 py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => openEditItem(item)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeletePriceListItem(item.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>

          ) : activeTab === 'gastos' ? (
            <div className="space-y-6">
              {creditStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white border border-gray-100 rounded-sm p-4 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Comprado</p>
                    <p className="text-2xl font-extrabold text-black">${creditStats.totalPurchased.toLocaleString('es-CL')}</p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-sm p-4 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Cobrado</p>
                    <p className="text-2xl font-extrabold text-black">${creditStats.totalCollected.toLocaleString('es-CL')}</p>
                  </div>
                  <div className={`bg-white border rounded-sm p-4 shadow-sm ${creditStats.profit >= 0 ? 'border-emerald-100' : 'border-red-100'}`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ganancia</p>
                    <p className={`text-2xl font-extrabold ${creditStats.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${creditStats.profit.toLocaleString('es-CL')}</p>
                  </div>
                  <div className="bg-white border border-amber-100 rounded-sm p-4 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pendiente por Cobrar</p>
                    <p className="text-2xl font-extrabold text-amber-600">${creditStats.totalBalance.toLocaleString('es-CL')}</p>
                  </div>
                </div>
              )}

              {!selectedCreditSale ? (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl font-extrabold text-black">Compras a Crédito</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Productos comprados y vendidos a crédito, con abonos.</p>
                    </div>
                    <button onClick={() => setShowNewCreditSaleModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-sm hover:bg-gray-800">
                      <Plus className="w-4 h-4" /> Nueva Venta a Crédito
                    </button>
                  </div>

                  <select
                    value={creditCustomerFilter}
                    onChange={e => { setCreditCustomerFilter(e.target.value); fetchCreditSales(e.target.value || undefined); }}
                    className="text-sm border border-gray-200 rounded-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="">Todos los clientes</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                  </select>

                  {creditSalesLoading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />Cargando...
                    </div>
                  ) : creditSales.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-sm text-gray-400">
                      <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No hay compras a crédito registradas todavía.</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-x-auto">
                      <table className="w-full min-w-[900px]">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 md:px-6 py-3 w-56">Producto</th>
                            <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Cliente</th>
                            <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">P. Compra</th>
                            <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">P. Venta</th>
                            <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Margen</th>
                            <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Cobrado</th>
                            <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Saldo</th>
                            <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Estado</th>
                            <th className="px-4 md:px-6 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {creditSales.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => fetchCreditSaleDetail(s.id)}>
                              <td className="px-4 md:px-6 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-[3.5rem] flex-shrink-0 rounded-sm border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                    {s.productImage ? (
                                      <img
                                        src={s.productImage.startsWith('http') ? s.productImage : `http://localhost:5173${s.productImage}`}
                                        alt={s.productName}
                                        className="w-full h-full object-contain p-0.5"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                      />
                                    ) : (
                                      <Package className="w-4 h-4 text-gray-300" />
                                    )}
                                  </div>
                                  <span className="font-semibold text-sm text-black leading-tight">{s.productName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{s.customerName}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-600">${s.purchasePrice.toLocaleString('es-CL')}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-600">${s.sellingPrice.toLocaleString('es-CL')}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`text-sm font-bold ${s.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{s.marginPercent}%</span>
                              </td>
                              <td className="px-4 py-3 text-right text-sm text-gray-600">${s.amountPaid.toLocaleString('es-CL')}</td>
                              <td className="px-4 py-3 text-right font-bold text-sm text-black">${s.balance.toLocaleString('es-CL')}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${s.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {s.isPaid ? 'Pagado' : 'Pendiente'}
                                </span>
                              </td>
                              <td className="px-4 md:px-6 py-3 text-right">
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteCreditSale(s.id); }}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedCreditSale(null)}
                      className="p-2 border border-gray-200 rounded-sm hover:bg-gray-50">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-xl font-extrabold text-black">{selectedCreditSale.productName}</h2>
                      <p className="text-sm text-gray-500">{selectedCreditSale.customerName} · Margen {selectedCreditSale.marginPercent}%</p>
                    </div>
                    <button onClick={() => setShowAddPaymentModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-sm hover:bg-gray-800">
                      <Plus className="w-4 h-4" /> Agregar Abono
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white border border-gray-100 rounded-sm p-4 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">P. Compra</p>
                      <p className="text-lg font-extrabold text-black">${selectedCreditSale.purchasePrice.toLocaleString('es-CL')}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-sm p-4 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">P. Venta</p>
                      <p className="text-lg font-extrabold text-black">${selectedCreditSale.sellingPrice.toLocaleString('es-CL')}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-sm p-4 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cobrado</p>
                      <p className="text-lg font-extrabold text-black">${selectedCreditSale.amountPaid.toLocaleString('es-CL')}</p>
                    </div>
                    <div className={`bg-white border rounded-sm p-4 shadow-sm ${selectedCreditSale.isPaid ? 'border-emerald-100' : 'border-amber-100'}`}>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Saldo Pendiente</p>
                      <p className={`text-lg font-extrabold ${selectedCreditSale.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>${selectedCreditSale.balance.toLocaleString('es-CL')}</p>
                    </div>
                  </div>

                  {selectedCreditSale.notes && (
                    <p className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-sm p-3">{selectedCreditSale.notes}</p>
                  )}

                  <div>
                    <h3 className="text-sm font-extrabold text-black mb-3">Historial de Abonos</h3>
                    {selectedCreditSale.payments.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-sm text-gray-400">
                        <p className="text-sm">Todavía no hay abonos registrados.</p>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 md:px-6 py-3">Fecha</th>
                              <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Monto</th>
                              <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Notas</th>
                              <th className="px-4 md:px-6 py-3"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {selectedCreditSale.payments.map(p => (
                              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 md:px-6 py-3 text-sm text-gray-600">{new Date(p.paymentDate).toLocaleDateString('es-CL')}</td>
                                <td className="px-4 py-3 text-right font-bold text-sm text-black">${p.amount.toLocaleString('es-CL')}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{p.notes || '—'}</td>
                                <td className="px-4 md:px-6 py-3 text-right">
                                  <button onClick={() => handleDeletePayment(p.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          ) : activeTab === 'reports' ? (
            <div className="space-y-6">
              {/* Header + sub-tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-black">Informes</h1>
                  <p className="text-xs text-gray-400 mt-0.5">Ganancias y envíos</p>
                </div>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                  {(['earnings', 'shipping'] as const).map(t => (
                    <button key={t} onClick={() => setReportTab(t)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${reportTab === t ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>
                      {t === 'earnings' ? 'Ganancias' : 'Envíos'}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── GANANCIAS ── */}
              {reportTab === 'earnings' && (() => {
                const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
                const PM_LABELS: Record<string, string> = { webpay: 'Webpay', sistecredito: 'Sistecredito', transfer: 'Transferencia bancaria' };

                const availYears = [...new Set(reportAllOrders.map(o => new Date(o.orderDate).getFullYear()))].sort((a, b) => b - a);
                if (availYears.length === 0) availYears.push(new Date().getFullYear());

                const filtered = reportAllOrders.filter(o => {
                  const d = new Date(o.orderDate);
                  if (d.getFullYear().toString() !== reportYear) return false;
                  if (reportMonth !== '0' && (d.getMonth() + 1).toString() !== reportMonth) return false;
                  if (reportDay !== '0' && d.getDate().toString() !== reportDay) return false;
                  return true;
                });

                const revenue   = filtered.filter(o => o.status !== 'Cancelado');
                const total     = revenue.reduce((s, o) => s + o.totalAmount, 0);
                const delivered = filtered.filter(o => o.status === 'Entregado');
                const cancelled = filtered.filter(o => o.status === 'Cancelado');
                const active    = filtered.filter(o => !['Entregado','Cancelado'].includes(o.status));

                // Period breakdown (monthly or daily)
                type GroupData = { count: number; total: number };
                const grouped: Record<string, GroupData> = {};
                if (reportMonth === '0') {
                  for (let m = 1; m <= 12; m++) {
                    const mo = filtered.filter(o => new Date(o.orderDate).getMonth() + 1 === m && o.status !== 'Cancelado');
                    if (mo.length) grouped[m.toString()] = { count: mo.length, total: mo.reduce((s, o) => s + o.totalAmount, 0) };
                  }
                } else {
                  const daysInMonth = new Date(parseInt(reportYear), parseInt(reportMonth), 0).getDate();
                  for (let d = 1; d <= daysInMonth; d++) {
                    const do_ = filtered.filter(o => new Date(o.orderDate).getDate() === d && o.status !== 'Cancelado');
                    if (do_.length) grouped[d.toString()] = { count: do_.length, total: do_.reduce((s, o) => s + o.totalAmount, 0) };
                  }
                }
                const maxGroupTotal = Math.max(...Object.values(grouped).map(g => g.total), 1);

                // By payment method
                const byPayment: Record<string, { count: number; total: number }> = {};
                revenue.forEach(o => {
                  const pm = o.paymentMethod ?? 'Sin especificar';
                  if (!byPayment[pm]) byPayment[pm] = { count: 0, total: 0 };
                  byPayment[pm].count++;
                  byPayment[pm].total += o.totalAmount;
                });

                // Top products
                const byProduct: Record<string, { qty: number; total: number }> = {};
                revenue.forEach(o => o.items.forEach(i => {
                  if (!byProduct[i.productName]) byProduct[i.productName] = { qty: 0, total: 0 };
                  byProduct[i.productName].qty   += i.quantity;
                  byProduct[i.productName].total += i.subtotal;
                }));
                const topProducts  = Object.entries(byProduct).sort((a, b) => b[1].total - a[1].total).slice(0, 5);
                const maxProdTotal = Math.max(...topProducts.map(([, d]) => d.total), 1);

                const daysInSel = reportMonth !== '0' ? new Date(parseInt(reportYear), parseInt(reportMonth), 0).getDate() : 31;

                return (
                  <>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 items-center bg-gray-50 border border-gray-100 rounded-sm px-4 py-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Año</label>
                        <select value={reportYear} onChange={e => { setReportYear(e.target.value); setReportMonth('0'); setReportDay('0'); }}
                          className="text-sm border border-gray-200 rounded-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-black bg-white">
                          {availYears.map(y => <option key={y} value={y.toString()}>{y}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mes</label>
                        <select value={reportMonth} onChange={e => { setReportMonth(e.target.value); setReportDay('0'); }}
                          className="text-sm border border-gray-200 rounded-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-black bg-white">
                          <option value="0">Todos</option>
                          {MONTHS.map((m, i) => <option key={i + 1} value={(i + 1).toString()}>{m}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Día</label>
                        <select value={reportDay} onChange={e => setReportDay(e.target.value)}
                          disabled={reportMonth === '0'}
                          className="text-sm border border-gray-200 rounded-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-black bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                          <option value="0">Todos</option>
                          {Array.from({ length: daysInSel }, (_, i) => <option key={i + 1} value={(i + 1).toString()}>{i + 1}</option>)}
                        </select>
                      </div>
                      <button onClick={fetchAllOrders}
                        className="ml-auto flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black border border-gray-200 bg-white px-3 py-1.5 rounded-sm transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                      </button>
                    </div>

                    {reportAllLoading ? (
                      <div className="flex items-center justify-center py-16 text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando datos...
                      </div>
                    ) : (
                      <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { label: 'Ingresos Totales', value: `$${total.toLocaleString('es-CO')}`, sub: `${revenue.length} pedido${revenue.length !== 1 ? 's' : ''}`, bg: 'bg-white border-gray-100', lc: 'text-gray-400', vc: 'text-black', sc: 'text-gray-400' },
                            { label: 'Promedio / Pedido', value: revenue.length > 0 ? `$${Math.round(total / revenue.length).toLocaleString('es-CO')}` : '$0', sub: 'por pedido', bg: 'bg-white border-gray-100', lc: 'text-gray-400', vc: 'text-black', sc: 'text-gray-400' },
                            { label: 'Entregados', value: delivered.length.toString(), sub: `$${delivered.reduce((s, o) => s + o.totalAmount, 0).toLocaleString('es-CO')}`, bg: 'bg-emerald-50 border-emerald-100', lc: 'text-emerald-500', vc: 'text-emerald-700', sc: 'text-emerald-400' },
                            { label: 'Cancelados', value: cancelled.length.toString(), sub: `${active.length} en proceso`, bg: 'bg-red-50 border-red-100', lc: 'text-red-400', vc: 'text-red-700', sc: 'text-gray-400' },
                          ].map(c => (
                            <div key={c.label} className={`border rounded-sm shadow-sm p-5 ${c.bg}`}>
                              <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-1 ${c.lc}`}>{c.label}</p>
                              <p className={`text-2xl font-extrabold ${c.vc}`}>{c.value}</p>
                              <p className={`text-xs mt-0.5 ${c.sc}`}>{c.sub}</p>
                            </div>
                          ))}
                        </div>

                        {/* Period bar chart */}
                        {Object.keys(grouped).length > 0 && (
                          <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                            <h2 className="text-xs font-extrabold text-black uppercase tracking-widest mb-5">
                              {reportMonth === '0'
                                ? `Ganancias por mes — ${reportYear}`
                                : `Ganancias por día — ${MONTHS[parseInt(reportMonth) - 1]} ${reportYear}`}
                            </h2>
                            <div className="space-y-2.5">
                              {Object.entries(grouped).map(([key, data]) => {
                                const label = reportMonth === '0' ? MONTHS[parseInt(key) - 1].slice(0, 3) : `${key}`;
                                const pct   = (data.total / maxGroupTotal) * 100;
                                return (
                                  <div key={key} className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-400 w-10 text-right flex-shrink-0">{label}</span>
                                    <div className="flex-1 relative bg-gray-100 rounded-full h-6 overflow-hidden">
                                      <div className="absolute inset-y-0 left-0 bg-black rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 1)}%` }} />
                                      <span className="absolute inset-y-0 left-3 flex items-center text-[10px] font-bold text-white mix-blend-difference select-none">{data.count} ped.</span>
                                    </div>
                                    <span className="text-xs font-extrabold text-black w-28 text-right flex-shrink-0">${data.total.toLocaleString('es-CO')}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* By payment method */}
                          <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                            <h2 className="text-xs font-extrabold text-black uppercase tracking-widest mb-4">Por método de pago</h2>
                            {Object.keys(byPayment).length === 0 ? (
                              <p className="text-xs text-gray-400 text-center py-6">Sin datos en este período</p>
                            ) : (
                              <div className="space-y-4">
                                {Object.entries(byPayment).sort((a, b) => b[1].total - a[1].total).map(([pm, data]) => {
                                  const pct = total > 0 ? (data.total / total) * 100 : 0;
                                  return (
                                    <div key={pm}>
                                      <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold text-gray-700">{PM_LABELS[pm] ?? pm}</span>
                                        <span className="text-xs font-extrabold text-black">
                                          ${data.total.toLocaleString('es-CO')} <span className="text-gray-400 font-normal">({Math.round(pct)}%)</span>
                                        </span>
                                      </div>
                                      <div className="bg-gray-100 rounded-full h-2.5">
                                        <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                                      </div>
                                      <p className="text-[10px] text-gray-400 mt-0.5">{data.count} pedido{data.count !== 1 ? 's' : ''}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Top products */}
                          <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                            <h2 className="text-xs font-extrabold text-black uppercase tracking-widest mb-4">Productos más vendidos</h2>
                            {topProducts.length === 0 ? (
                              <p className="text-xs text-gray-400 text-center py-6">Sin datos en este período</p>
                            ) : (
                              <div className="space-y-4">
                                {topProducts.map(([name, data]) => {
                                  const pct = (data.total / maxProdTotal) * 100;
                                  return (
                                    <div key={name}>
                                      <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold text-gray-700 truncate max-w-[55%]">{name}</span>
                                        <span className="text-xs font-extrabold text-black">
                                          ${data.total.toLocaleString('es-CO')} <span className="text-gray-400 font-normal">× {data.qty}</span>
                                        </span>
                                      </div>
                                      <div className="bg-gray-100 rounded-full h-2.5">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Orders table */}
                        {filtered.length > 0 ? (
                          <div>
                            <h2 className="text-xs font-extrabold text-black uppercase tracking-widest mb-3">
                              Detalle de pedidos — {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
                            </h2>
                            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-x-auto">
                              <table className="w-full text-left border-collapse min-w-[680px]">
                                <thead>
                                  <tr className="border-b border-gray-100">
                                    <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Pedido</th>
                                    <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Cliente</th>
                                    <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Fecha</th>
                                    <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Pago</th>
                                    <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Estado</th>
                                    <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3 text-right">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {[...filtered].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).map(o => {
                                    const sc = STATUS_CONFIG[o.status] ?? { label: o.status, color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
                                    return (
                                      <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3"><span className="font-mono font-bold text-xs text-black">{o.orderNumber}</span></td>
                                        <td className="px-4 py-3">
                                          <p className="text-sm font-semibold text-black">{o.customerName}</p>
                                          <p className="text-xs text-gray-400">{o.customerCity}</p>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                          {new Date(o.orderDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                          {o.paymentMethod ? (PM_LABELS[o.paymentMethod] ?? o.paymentMethod) : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full border ${sc.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                                          </span>
                                        </td>
                                        <td className="px-5 py-3 text-right font-bold text-sm text-black">${o.totalAmount.toLocaleString('es-CO')}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                <tfoot className="border-t-2 border-gray-200">
                                  <tr className="bg-gray-50">
                                    <td colSpan={5} className="px-5 py-3 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right">Total (excl. cancelados)</td>
                                    <td className="px-5 py-3 text-right font-extrabold text-base text-black">${total.toLocaleString('es-CO')}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-sm text-gray-400">
                            <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No hay pedidos en el período seleccionado.</p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })()}

              {/* ── ENVÍOS ── */}
              {reportTab === 'shipping' && (() => {
                const sentOrders = reportAllOrders.filter(o => o.carrier);
                const byCarrier: Record<string, { count: number; total: number; delivered: number }> = {};
                sentOrders.forEach(o => {
                  const key = o.carrier!;
                  if (!byCarrier[key]) byCarrier[key] = { count: 0, total: 0, delivered: 0 };
                  byCarrier[key].count++;
                  byCarrier[key].total += o.totalAmount;
                  if (o.status === 'Entregado') byCarrier[key].delivered++;
                });
                const rows = Object.entries(byCarrier).sort((a, b) => b[1].count - a[1].count);
                return rows.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-sm text-gray-400">
                    <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aún no hay pedidos con transportadora asignada.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rows.map(([name, data]) => {
                        const carrierInfo = carriers.find(c => c.name === name);
                        return (
                          <div key={name} className="bg-white border border-gray-100 rounded-sm shadow-sm p-5">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                                <Truck className="w-5 h-5 text-sky-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-black truncate">{name}</p>
                                {carrierInfo?.contactInfo && <p className="text-xs text-gray-400 truncate">{carrierInfo.contactInfo}</p>}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-gray-50 rounded-sm px-2 py-2">
                                <p className="text-2xl font-extrabold text-black">{data.count}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Pedidos</p>
                              </div>
                              <div className="bg-green-50 rounded-sm px-2 py-2">
                                <p className="text-2xl font-extrabold text-green-700">{data.delivered}</p>
                                <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mt-0.5">Entregados</p>
                              </div>
                              <div className="bg-sky-50 rounded-sm px-2 py-2">
                                <p className="text-sm font-extrabold text-sky-700 leading-tight mt-1">${Math.round(data.total / data.count).toLocaleString('es-CO')}</p>
                                <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mt-0.5">Prom.</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div>
                      <h2 className="text-xs font-extrabold text-black uppercase tracking-widest mb-3">Detalle de pedidos enviados</h2>
                      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Pedido</th>
                              <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Cliente</th>
                              <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Transportadora</th>
                              <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Guía</th>
                              <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Estado</th>
                              <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Fecha</th>
                              <th className="text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {sentOrders.map(o => {
                              const sc = STATUS_CONFIG[o.status] ?? { label: o.status, color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
                              return (
                                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-3"><span className="font-mono text-xs font-bold text-black">{o.orderNumber}</span></td>
                                  <td className="px-4 py-3">
                                    <p className="text-sm font-semibold text-black truncate max-w-[150px]">{o.customerName}</p>
                                    <p className="text-xs text-gray-400">{o.customerCity}</p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                      <Truck className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                                      <span className="text-sm font-medium text-gray-700">{o.carrier}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    {o.trackingNumber
                                      ? <span className="font-mono text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-sm">{o.trackingNumber}</span>
                                      : <span className="text-gray-300 text-xs">—</span>}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full border ${sc.color}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.orderDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                  <td className="px-6 py-3 text-right font-bold text-sm text-black">${o.totalAmount.toLocaleString('es-CO')}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

          ) : activeTab === 'dashboard' ? (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Pedidos', value: orders.length,                                                              sub: 'pedidos totales',    icon: ClipboardList, bg: 'bg-violet-500',  ring: 'ring-violet-100',  iconColor: 'text-violet-500'  },
                  { label: 'Procesando',    value: orders.filter(o => ['Procesando','Picking'].includes(o.status)).length,    sub: 'en preparación',     icon: Package,       bg: 'bg-amber-500',   ring: 'ring-amber-100',   iconColor: 'text-amber-500'   },
                  { label: 'En Camino',     value: orders.filter(o => ['Enviado','En Tránsito'].includes(o.status)).length,   sub: 'en tránsito',        icon: TrendingUp,    bg: 'bg-sky-500',     ring: 'ring-sky-100',     iconColor: 'text-sky-500'     },
                  { label: 'Entregados',    value: orders.filter(o => o.status === 'Entregado').length,                       sub: 'completados',        icon: Users,         bg: 'bg-emerald-500', ring: 'ring-emerald-100', iconColor: 'text-emerald-500' },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className={`rounded-2xl px-5 py-4 shadow-sm text-white flex items-center gap-4 ${stat.bg}`}>
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-3xl font-extrabold leading-none mb-1">{stat.value}</p>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-90">{stat.label}</p>
                        <p className="text-[11px] opacity-70 mt-0.5">{stat.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent orders */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800">Pedidos Recientes</h2>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Ver todos →</button>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 md:px-6 py-3 text-xs font-semibold text-slate-500">ID Pedido</th>
                      <th className="px-4 md:px-6 py-3 text-xs font-semibold text-slate-500">Cliente</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500">Estado</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.slice(0, 5).map(order => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => { setSelectedOrder(order); setActiveTab('orders'); }}
                      >
                        <td className="px-6 py-3 text-sm font-bold text-slate-800">{order.orderNumber}</td>
                        <td className="px-6 py-3 text-sm text-slate-600">{order.customerName}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${STATUS_CONFIG[order.status]?.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[order.status]?.dot}`} />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm font-bold text-slate-800 text-right">${order.totalAmount.toLocaleString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'recommended' ? (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-black mb-1">Productos Recomendados</h1>
                <p className="text-sm text-gray-400">Activa la estrella para mostrar un producto en la sección de recomendados del inicio. Define el orden de aparición.</p>
              </div>

              {productsLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando productos...
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-sm text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay productos disponibles.</p>
                </div>
              ) : (
                <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Recomendado</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Orden</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((product) => {
                        const orderVal = recOrderEdits[product.id] ?? product.recommendedOrder;
                        const isSaving = recSavingId === product.id;

                        const saveRecommended = async (isRec: boolean, order: number) => {
                          setRecSavingId(product.id);
                          try {
                            await fetch(`${API}/api/recommended/${product.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ isRecommended: isRec, recommendedOrder: order }),
                            });
                            setProducts(prev => prev.map(p =>
                              p.id === product.id ? { ...p, isRecommended: isRec, recommendedOrder: order } : p
                            ));
                          } catch { /* silencioso */ }
                          finally { setRecSavingId(null); }
                        };

                        return (
                          <tr key={product.id} className={`transition-colors ${product.isRecommended ? 'bg-amber-50 hover:bg-amber-50/70' : 'hover:bg-gray-50'}`}>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-[3.5rem] flex-shrink-0 rounded-sm border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                  {product.images?.[0] ? (
                                    <img
                                      src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5173${product.images[0]}`}
                                      alt={product.name}
                                      className="w-full h-full object-contain p-0.5"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  ) : (
                                    <Package className="w-4 h-4 text-gray-300" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-black leading-tight">{product.name}</p>
                                  {product.manufacturer && <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">{product.manufacturer}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin text-amber-400 mx-auto" />
                              ) : (
                                <button
                                  onClick={() => saveRecommended(!product.isRecommended, orderVal)}
                                  title={product.isRecommended ? 'Quitar de recomendados' : 'Marcar como recomendado'}
                                  className="mx-auto block transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={`w-6 h-6 transition-colors ${product.isRecommended ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'}`}
                                  />
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {product.isRecommended ? (
                                <input
                                  type="number"
                                  min={0}
                                  value={orderVal}
                                  onChange={(e) => setRecOrderEdits(prev => ({ ...prev, [product.id]: Number(e.target.value) }))}
                                  onBlur={() => saveRecommended(true, orderVal)}
                                  className="w-16 border border-gray-200 rounded-sm text-center text-sm font-bold py-1 focus:outline-none focus:border-amber-400"
                                  disabled={isSaving}
                                />
                              ) : (
                                <span className="text-gray-300 text-sm">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === 'featured' ? (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-black mb-1">Novedades Destacadas</h1>
                <p className="text-sm text-gray-400">Activa el ícono para mostrar un producto en el slider "Novedades Destacadas" del inicio. Define el orden de aparición.</p>
              </div>

              {productsLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando productos...
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-sm text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay productos disponibles.</p>
                </div>
              ) : (
                <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Destacado</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Orden</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((product) => {
                        const orderVal = featOrderEdits[product.id] ?? product.featuredOrder;
                        const isSaving = featSavingId === product.id;

                        const saveFeatured = async (isFeat: boolean, order: number) => {
                          setFeatSavingId(product.id);
                          try {
                            await fetch(`${API}/api/featured/${product.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ isFeatured: isFeat, featuredOrder: order }),
                            });
                            setProducts(prev => prev.map(p =>
                              p.id === product.id ? { ...p, isFeatured: isFeat, featuredOrder: order } : p
                            ));
                          } catch { /* silencioso */ }
                          finally { setFeatSavingId(null); }
                        };

                        return (
                          <tr key={product.id} className={`transition-colors ${product.isFeatured ? 'bg-blue-50 hover:bg-blue-50/70' : 'hover:bg-gray-50'}`}>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-[3.5rem] flex-shrink-0 rounded-sm border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                  {product.images?.[0] ? (
                                    <img
                                      src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5173${product.images[0]}`}
                                      alt={product.name}
                                      className="w-full h-full object-contain p-0.5"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  ) : (
                                    <Package className="w-4 h-4 text-gray-300" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-black leading-tight">{product.name}</p>
                                  {product.manufacturer && <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">{product.manufacturer}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin text-blue-400 mx-auto" />
                              ) : (
                                <button
                                  onClick={() => saveFeatured(!product.isFeatured, orderVal)}
                                  title={product.isFeatured ? 'Quitar de destacados' : 'Marcar como destacado'}
                                  className="mx-auto block transition-transform hover:scale-110"
                                >
                                  <TrendingUp
                                    className={`w-6 h-6 transition-colors ${product.isFeatured ? 'text-blue-500' : 'text-gray-300 hover:text-blue-300'}`}
                                  />
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {product.isFeatured ? (
                                <input
                                  type="number"
                                  min={0}
                                  value={orderVal}
                                  onChange={(e) => setFeatOrderEdits(prev => ({ ...prev, [product.id]: Number(e.target.value) }))}
                                  onBlur={() => saveFeatured(true, orderVal)}
                                  className="w-16 border border-gray-200 rounded-sm text-center text-sm font-bold py-1 focus:outline-none focus:border-blue-400"
                                  disabled={isSaving}
                                />
                              ) : (
                                <span className="text-gray-300 text-sm">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === 'international' ? (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-black mb-1">Productos Internacionales</h1>
                <p className="text-sm text-gray-400">Activa el ícono para marcar un producto como pedido internacional. Se mostrará una insignia de "Envío 10-15 días" en su foto dentro del catálogo y la ficha del producto.</p>
              </div>

              {productsLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando productos...
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-sm text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay productos disponibles.</p>
                </div>
              ) : (
                <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Internacional</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((product) => {
                        const isSaving = intlSavingId === product.id;

                        const saveInternational = async (isIntl: boolean) => {
                          setIntlSavingId(product.id);
                          try {
                            await fetch(`${API}/api/international/${product.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ isInternational: isIntl }),
                            });
                            setProducts(prev => prev.map(p =>
                              p.id === product.id ? { ...p, isInternational: isIntl } : p
                            ));
                          } catch { /* silencioso */ }
                          finally { setIntlSavingId(null); }
                        };

                        return (
                          <tr key={product.id} className={`transition-colors ${product.isInternational ? 'bg-blue-50 hover:bg-blue-50/70' : 'hover:bg-gray-50'}`}>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-[3.5rem] flex-shrink-0 rounded-sm border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                  {product.images?.[0] ? (
                                    <img
                                      src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5173${product.images[0]}`}
                                      alt={product.name}
                                      className="w-full h-full object-contain p-0.5"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  ) : (
                                    <Package className="w-4 h-4 text-gray-300" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-black leading-tight">{product.name}</p>
                                  {product.manufacturer && <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">{product.manufacturer}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin text-blue-400 mx-auto" />
                              ) : (
                                <button
                                  onClick={() => saveInternational(!product.isInternational)}
                                  title={product.isInternational ? 'Quitar marca de internacional' : 'Marcar como pedido internacional'}
                                  className="mx-auto block transition-transform hover:scale-110"
                                >
                                  <Globe
                                    className={`w-6 h-6 transition-colors ${product.isInternational ? 'text-blue-500' : 'text-gray-300 hover:text-blue-300'}`}
                                  />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-white">
              <Settings className="w-12 h-12 text-slate-200 mb-4" />
              <h2 className="text-lg font-bold text-slate-600 mb-1">Sección en Construcción</h2>
              <p className="text-sm text-slate-400">La vista de "<span className="font-medium">{activeTab}</span>" estará disponible próximamente.</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-xl font-extrabold text-black">Nuevo Producto</h3>
              <button onClick={closeProductModal} className="text-gray-400 hover:text-black transition-colors">
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="overflow-y-auto flex-1 flex flex-col">
              <div className="p-6 space-y-8 flex-1">

                {/* Información Básica */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">Información Básica</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre *</label>
                      <input type="text" required value={npForm.name} onChange={e => handleNpFieldChange('name', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Ej: Termo Stanley Classic 1.4L" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fabricante</label>
                        <input type="text" value={npForm.manufacturer} onChange={e => handleNpFieldChange('manufacturer', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Ej: Stanley" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Medidas</label>
                        <input type="text" value={npForm.measurements} onChange={e => handleNpFieldChange('measurements', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Ej: 30cm x 10cm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descripción</label>
                      <textarea rows={2} value={npForm.description} onChange={e => handleNpFieldChange('description', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" placeholder="Resumen breve del producto..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descripción Detallada</label>
                      <textarea rows={4} value={npForm.detailedDescription} onChange={e => handleNpFieldChange('detailedDescription', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" placeholder="Características, especificaciones técnicas, detalles..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Componentes</label>
                        <textarea rows={3} value={npForm.components} onChange={e => handleNpFieldChange('components', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" placeholder="Ej: Tapa, cuerpo, sello..." />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Materiales</label>
                        <textarea rows={3} value={npForm.materials} onChange={e => handleNpFieldChange('materials', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" placeholder="Ej: Acero inoxidable 18/8..." />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estilo y Clasificación */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">Estilo y Clasificación</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {([
                      { label: 'Color',    field: 'color',    placeholder: 'Ej: Verde Hammertone' },
                      { label: 'Forma',    field: 'shape',    placeholder: 'Ej: Cilíndrico' },
                      { label: 'Diseño',   field: 'design',   placeholder: 'Ej: Clásico' },
                      { label: 'Ocasión',  field: 'occasion', placeholder: 'Ej: Outdoor, Oficina' },
                      { label: 'Tamaño',   field: 'size',     placeholder: 'Ej: Grande / 1.4L' },
                      { label: 'Capacidad',field: 'capacity', placeholder: 'Ej: 1400ml' },
                    ] as { label: string; field: keyof typeof npForm; placeholder: string }[]).map(({ label, field, placeholder }) => (
                      <div key={field}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                        <input type="text" value={npForm[field]} onChange={e => handleNpFieldChange(field, e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder={placeholder} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Categoría *</label>
                      <select required value={npCatId} onChange={e => { setNpCatId(e.target.value); setNpBrandId(''); setNpTypeId(''); setNpSubTypeId(''); }}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                        <option value="">— Selecciona Categoría —</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Marca</label>
                      <select value={npBrandId} onChange={e => { setNpBrandId(e.target.value); setNpTypeId(''); setNpSubTypeId(''); }} disabled={!npCatId}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white disabled:bg-gray-50 disabled:text-gray-400">
                        <option value="">— Selecciona Marca —</option>
                        {npBrandsForCat.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tipo</label>
                      <select value={npTypeId} onChange={e => { setNpTypeId(e.target.value); setNpSubTypeId(''); }} disabled={!npBrandId}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white disabled:bg-gray-50 disabled:text-gray-400">
                        <option value="">— Selecciona Tipo —</option>
                        {npTypesForBrand.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">SubTipo</label>
                      <select value={npSubTypeId} onChange={e => setNpSubTypeId(e.target.value)} disabled={!npTypeId}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white disabled:bg-gray-50 disabled:text-gray-400">
                        <option value="">— Selecciona SubTipo —</option>
                        {npSubTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Precio */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">Precio al Público</h4>
                  <div className="flex gap-4 flex-wrap">
                    <div className="max-w-xs flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Precio de Venta</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input type="number" min="0" step="1" value={npForm.sellingPrice} onChange={e => handleNpFieldChange('sellingPrice', e.target.value)}
                          className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="0" />
                      </div>
                    </div>
                    <div className="w-36">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descuento %</label>
                      <div className="relative">
                        <input type="number" min="0" max="100" step="1" value={npForm.discountPercentage} onChange={e => handleNpFieldChange('discountPercentage', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="0" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fotos */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">Fotos (máx. 5)</h4>
                  <div className="flex gap-3 flex-wrap">
                    {npImagePreviews.map((src, i) => (
                      <div key={i} className="relative w-24 h-24 rounded-sm border border-gray-200 overflow-hidden group">
                        <img src={src} className="w-full h-full object-cover" alt={`foto-${i + 1}`} />
                        <button type="button" onClick={() => removeNpImage(i)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    ))}
                    {npImagePreviews.length < 5 && (
                      <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors">
                        <Plus className="w-5 h-5 text-gray-400" />
                        <span className="text-[10px] text-gray-400 mt-1">Agregar</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleNpImageSelect} />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">La primera foto será la imagen principal del producto.</p>
                </div>


              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
                {productError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-sm text-sm mb-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {productError}
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={closeProductModal}
                    className="px-6 py-2.5 font-bold text-sm text-gray-600 hover:bg-gray-100 rounded-sm transition-colors uppercase tracking-wider">
                    Cancelar
                  </button>
                  <button type="submit" disabled={productSaving}
                    className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 rounded-sm transition-colors uppercase tracking-wider">
                    {productSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Guardar Producto'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-black">Editar Categoría</h3>
              <button onClick={() => setEditingCategory(null)} className="text-gray-400 hover:text-black transition-colors">
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
            <form onSubmit={handleEditCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre</label>
                <input
                  type="text"
                  required
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción (Opcional)</label>
                <textarea
                  value={editCategoryDesc}
                  onChange={(e) => setEditCategoryDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none h-24"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-6 py-3 font-bold text-sm text-gray-600 hover:bg-gray-100 rounded-sm transition-colors uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 font-bold text-sm text-white bg-black hover:bg-gray-800 rounded-sm transition-colors uppercase tracking-wider"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-black">Nueva Categoría</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-black transition-colors">
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre</label>
                <input 
                  type="text" 
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Ej: Accesorios"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción (Opcional)</label>
                <textarea 
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none h-24"
                  placeholder="Breve descripción de la categoría..."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCategoryModal(false)}
                  className="px-6 py-3 font-bold text-sm text-gray-600 hover:bg-gray-100 rounded-sm transition-colors uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 font-bold text-sm text-white bg-black hover:bg-gray-800 rounded-sm transition-colors uppercase tracking-wider"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-black">Nueva Marca</h3>
              <button onClick={() => setShowBrandModal(false)} className="text-gray-400 hover:text-black transition-colors">
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
            <form onSubmit={handleAddBrand} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre de Marca</label>
                <input 
                  type="text" 
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Ej: Stanley"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowBrandModal(false)}
                  className="px-6 py-3 font-bold text-sm text-gray-600 hover:bg-gray-100 rounded-sm transition-colors uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 font-bold text-sm text-white bg-black hover:bg-gray-800 rounded-sm transition-colors uppercase tracking-wider"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-black">Nuevo Tipo</h3>
              <button onClick={() => setShowTypeModal(false)} className="text-gray-400 hover:text-black transition-colors">
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
            <form onSubmit={handleAddType} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción del Tipo</label>
                <input 
                  type="text" 
                  required
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Ej: Vaso, Botella, Mug"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowTypeModal(false)}
                  className="px-6 py-3 font-bold text-sm text-gray-600 hover:bg-gray-100 rounded-sm transition-colors uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 font-bold text-sm text-white bg-black hover:bg-gray-800 rounded-sm transition-colors uppercase tracking-wider"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SubType Modal */}
      {showSubTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-black">Nuevo SubTipo</h3>
              <button onClick={() => setShowSubTypeModal(false)} className="text-gray-400 hover:text-black transition-colors">
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
            <form onSubmit={handleAddSubType} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre del SubTipo</label>
                <input
                  type="text"
                  required
                  value={newSubTypeName}
                  onChange={(e) => setNewSubTypeName(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Ej: 30Oz, 40Oz, 1L"
                  autoFocus
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubTypeModal(false)}
                  className="px-6 py-3 font-bold text-sm text-gray-600 hover:bg-gray-100 rounded-sm transition-colors uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 font-bold text-sm text-white bg-black hover:bg-gray-800 rounded-sm transition-colors uppercase tracking-wider"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Modal: Guía de Envío ===== */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-extrabold text-black">Registrar Guía de Envío</h2>
                <p className="text-sm text-gray-500 mt-0.5">El estado cambiará a <span className="font-bold text-sky-600">Enviado</span></p>
              </div>
              <button onClick={cancelShipping} className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Transportadora <span className="text-red-500">*</span>
                </label>
                <select
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-all text-sm font-medium"
                >
                  {carriers.filter(c => c.isActive).map((c: ApiCarrier) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  {carriers.filter(c => c.isActive).length === 0 && (
                    <option value="">— Sin transportadoras activas —</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Número de Guía <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Ej: CHL-2024-00123456"
                  className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-all font-mono text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && confirmShipping()}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={cancelShipping}
                className="px-5 py-2.5 font-bold text-sm text-gray-600 hover:bg-gray-100 rounded-sm transition-colors uppercase tracking-wider"
              >
                Cancelar
              </button>
              <button
                onClick={confirmShipping}
                disabled={!trackingInput.trim()}
                className="px-5 py-2.5 font-bold text-sm text-white bg-sky-600 hover:bg-sky-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-sm transition-colors uppercase tracking-wider"
              >
                Confirmar Envío
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovementModal && movementProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-black">Registrar Movimiento</h3>
                <p className="text-xs text-gray-500 mt-0.5">{movementProduct.name} — Stock actual: <strong>{movementProduct.stock}</strong></p>
              </div>
              <button onClick={() => setShowMovementModal(false)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddMovement} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tipo de Movimiento</label>
                <select value={movForm.type} onChange={e => setMovForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                  <option value="Entrada">Entrada — suma al stock</option>
                  <option value="Salida">Salida — resta del stock</option>
                  <option value="Ajuste">Ajuste — establece el stock directamente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  {movForm.type === 'Ajuste' ? 'Nuevo Stock Total' : 'Cantidad'}
                </label>
                <input type="number" min="1" required value={movForm.quantity}
                  onChange={e => setMovForm(p => ({ ...p, quantity: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="0" />
              </div>
              {/* Stock preview */}
              {movementProduct && movForm.quantity && Number(movForm.quantity) > 0 && (() => {
                const qty = Number(movForm.quantity);
                const current = movementProduct.stock;
                const next = movForm.type === 'Entrada' ? current + qty
                  : movForm.type === 'Salida' ? current - qty
                  : qty;
                const isValid = next >= 0;
                return (
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-sm text-sm border ${isValid ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'}`}>
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Stock resultante</span>
                    <span className={`font-extrabold text-base ${isValid ? 'text-black' : 'text-red-600'}`}>
                      {current} → {next < 0 ? <span className="text-red-600">insuficiente</span> : next}
                    </span>
                  </div>
                );
              })()}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notas (opcional)</label>
                <textarea rows={2} value={movForm.notes} onChange={e => setMovForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  placeholder="Ej: Recepción de mercadería, Venta pedido #123..." />
              </div>
              {movError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-sm text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{movError}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowMovementModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-sm uppercase tracking-wider">Cancelar</button>
                <button type="submit" disabled={movSaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 rounded-sm uppercase tracking-wider">
                  {movSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : 'Guardar Movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && historyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="text-lg font-extrabold text-black">Historial de Movimientos</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {historyProduct.name} — Stock actual: <span className="font-bold text-black">{historyProduct.stock}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => refreshHistory(historyProduct.id)} title="Actualizar"
                  className="p-1.5 text-gray-400 hover:text-black transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {historyLoading ? (
                <div className="flex items-center justify-center py-10 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />Cargando historial...
                </div>
              ) : historyMovements.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay movimientos registrados.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {historyMovements.map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-sm hover:bg-gray-50 transition-colors">
                      <div className={`w-1.5 self-stretch rounded-full flex-shrink-0 ${m.type === 'Entrada' ? 'bg-emerald-500' : m.type === 'Salida' ? 'bg-red-500' : 'bg-blue-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.type === 'Entrada' ? 'bg-emerald-100 text-emerald-700' : m.type === 'Salida' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {m.type}
                          </span>
                          <span className="text-sm font-bold text-black">
                            {m.type === 'Ajuste' ? `Ajuste → ${m.newStock}` : m.type === 'Entrada' ? `+${m.quantity} unidades` : `-${m.quantity} unidades`}
                          </span>
                        </div>
                        {m.notes && <p className="text-xs text-gray-500 mt-0.5">{m.notes}</p>}
                        <p className="text-[10px] text-gray-400 mt-0.5">{new Date(m.createdAt).toLocaleString('es-CL')}</p>
                      </div>
                      <div className="text-right flex-shrink-0 mr-1">
                        <p className="text-xs font-semibold text-gray-600">{m.previousStock} → <span className="text-black font-bold">{m.newStock}</span></p>
                        <p className="text-[10px] text-gray-400">stock</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => openEditMovement(m)} title="Editar movimiento"
                          className="p-1.5 text-gray-400 hover:text-black transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteMovement(m.id)} title="Eliminar movimiento"
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Movement Modal */}
      {editingMovement && historyProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-sm">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-black">Editar Movimiento</h3>
              <button onClick={() => setEditingMovement(null)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditMovement} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tipo</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Entrada','Salida','Ajuste'] as const).map(t => (
                    <button type="button" key={t} onClick={() => setEditMovForm(p => ({ ...p, type: t }))}
                      className={`py-2 text-xs font-bold rounded-sm border transition-colors ${editMovForm.type === t
                        ? t === 'Entrada' ? 'bg-emerald-600 text-white border-emerald-600'
                          : t === 'Salida' ? 'bg-red-600 text-white border-red-600'
                          : 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  {editMovForm.type === 'Ajuste' ? 'Stock Final' : 'Cantidad'}
                </label>
                <input type="number" min="1" required value={editMovForm.quantity}
                  onChange={e => setEditMovForm(p => ({ ...p, quantity: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notas</label>
                <input type="text" value={editMovForm.notes}
                  onChange={e => setEditMovForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Motivo del movimiento..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              {editMovError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-sm text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{editMovError}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditingMovement(null)}
                  className="flex-1 py-2.5 font-bold text-sm text-gray-600 border border-gray-200 rounded-sm hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={editMovSaving}
                  className="flex-1 py-2.5 font-bold text-sm text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 rounded-sm flex items-center justify-center gap-2">
                  {editMovSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Price List Modal */}
      {showNewPriceListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-black">Nueva Lista de Precios</h3>
              <button onClick={() => setShowNewPriceListModal(false)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreatePriceList} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre *</label>
                <input type="text" required value={newPLName} onChange={e => setNewPLName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Ej: Lista Mayorista 2026" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descripción</label>
                <textarea rows={2} value={newPLDesc} onChange={e => setNewPLDesc(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" placeholder="Descripción opcional..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowNewPriceListModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-sm uppercase tracking-wider">Cancelar</button>
                <button type="submit" disabled={plSaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 rounded-sm uppercase tracking-wider">
                  {plSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Creando...</> : 'Crear Lista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && selectedPriceList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-black">Agregar Producto a Lista</h3>
              <button onClick={() => setShowAddItemModal(false)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddPriceListItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Producto *</label>
                <select required value={itemForm.productId} onChange={e => setItemForm(p => ({ ...p, productId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                  <option value="">— Selecciona un producto —</option>
                  {products.map((p: ApiProduct) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Característica</label>
                <input type="text" value={itemForm.characteristic} onChange={e => setItemForm(p => ({ ...p, characteristic: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Ej: 30oz Verde, Talla M..." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">P. Compra</label>
                  <input type="number" min="0" step="0.01" value={itemForm.purchasePrice} onChange={e => setItemForm(p => ({ ...p, purchasePrice: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">P. Venta</label>
                  <input type="number" min="0" step="0.01" required value={itemForm.sellingPrice} onChange={e => setItemForm(p => ({ ...p, sellingPrice: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descuento %</label>
                  <input type="number" min="0" max="100" step="0.01" value={itemForm.discountPercent} onChange={e => setItemForm(p => ({ ...p, discountPercent: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="0" />
                </div>
              </div>
              {itemError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-sm text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{itemError}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddItemModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-sm uppercase tracking-wider">Cancelar</button>
                <button type="submit" disabled={itemSaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 rounded-sm uppercase tracking-wider">
                  {itemSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Agregando...</> : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Price List Item Modal */}
      {editingItem && selectedPriceList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-black">Editar Ítem</h3>
                <p className="text-xs text-gray-400 mt-0.5">{editingItem.productName}</p>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdatePriceListItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Característica</label>
                <input type="text" value={plItemEditForm.characteristic} onChange={e => setPlItemEditForm(p => ({ ...p, characteristic: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Ej: 30oz Verde, Talla M..." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">P. Compra</label>
                  <input type="number" min="0" step="0.01" value={plItemEditForm.purchasePrice} onChange={e => setPlItemEditForm(p => ({ ...p, purchasePrice: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">P. Venta</label>
                  <input type="number" min="0" step="0.01" required value={plItemEditForm.sellingPrice} onChange={e => setPlItemEditForm(p => ({ ...p, sellingPrice: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descuento %</label>
                  <input type="number" min="0" max="100" step="0.01" value={plItemEditForm.discountPercent} onChange={e => setPlItemEditForm(p => ({ ...p, discountPercent: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="0" />
                </div>
              </div>
              {plItemEditError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-sm text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{plItemEditError}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingItem(null)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-sm uppercase tracking-wider">Cancelar</button>
                <button type="submit" disabled={plItemEditSaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 rounded-sm uppercase tracking-wider">
                  {plItemEditSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nueva Venta a Crédito Modal */}
      {showNewCreditSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-black">Nueva Venta a Crédito</h3>
              <button onClick={() => setShowNewCreditSaleModal(false)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateCreditSale} className="p-6 space-y-4">
              <div ref={productPickerRef} className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Producto *</label>
                <button type="button" onClick={() => setProductPickerOpen(o => !o)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 border border-gray-200 rounded-sm text-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-black">
                  {(() => {
                    const selected = products.find((p: ApiProduct) => p.id === newCreditSaleForm.productId);
                    if (!selected) return <span className="flex-1 text-gray-400">— Selecciona un producto —</span>;
                    const img = selected.images?.[0];
                    return (
                      <>
                        <div className="w-8 h-8 flex-shrink-0 rounded-sm border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                          {img ? (
                            <img src={img.startsWith('http') ? img : `http://localhost:5173${img}`} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <Package className="w-3.5 h-3.5 text-gray-300" />
                          )}
                        </div>
                        <span className="flex-1 truncate">{selected.name}</span>
                      </>
                    );
                  })()}
                  <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${productPickerOpen ? 'rotate-180' : ''}`} />
                </button>
                {productPickerOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-sm shadow-lg flex flex-col">
                    <input
                      type="text"
                      autoFocus
                      value={productSearchQuery}
                      onChange={e => setProductSearchQuery(e.target.value)}
                      placeholder="Buscar producto..."
                      className="px-3 py-2 border-b border-gray-100 text-sm focus:outline-none"
                    />
                    <div className="max-h-56 overflow-y-auto">
                      {products
                        .filter((p: ApiProduct) => p.name.toLowerCase().includes(productSearchQuery.trim().toLowerCase()))
                        .map((p: ApiProduct) => {
                          const img = p.images?.[0];
                          return (
                            <button
                              type="button"
                              key={p.id}
                              onClick={() => { setNewCreditSaleForm(f => ({ ...f, productId: p.id })); setProductPickerOpen(false); setProductSearchQuery(''); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-left"
                            >
                              <div className="w-8 h-8 flex-shrink-0 rounded-sm border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                {img ? (
                                  <img src={img.startsWith('http') ? img : `http://localhost:5173${img}`} alt="" className="w-full h-full object-contain" />
                                ) : (
                                  <Package className="w-3.5 h-3.5 text-gray-300" />
                                )}
                              </div>
                              <span className="text-sm truncate">{p.name}</span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente *</label>
                  <button type="button" onClick={() => { setQuickAddCustomer(true); openNewClient(); }}
                    className="flex items-center gap-1 text-[11px] font-bold text-black hover:opacity-60 uppercase tracking-wider">
                    <Plus className="w-3 h-3" /> Nuevo Cliente
                  </button>
                </div>
                <select required value={newCreditSaleForm.customerId} onChange={e => setNewCreditSaleForm(p => ({ ...p, customerId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                  <option value="">— Selecciona un cliente —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Precio Compra *</label>
                  <input type="number" min="0" step="0.01" required value={newCreditSaleForm.purchasePrice}
                    onChange={e => setNewCreditSaleForm(p => ({ ...p, purchasePrice: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Precio Venta *</label>
                  <input type="number" min="0" step="0.01" required value={newCreditSaleForm.sellingPrice}
                    onChange={e => setNewCreditSaleForm(p => ({ ...p, sellingPrice: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="0" />
                </div>
              </div>
              {(Number(newCreditSaleForm.purchasePrice) > 0 || Number(newCreditSaleForm.sellingPrice) > 0) && (
                <p className="text-xs text-gray-500">
                  Margen: <span className={`font-bold ${Number(newCreditSaleForm.sellingPrice) - Number(newCreditSaleForm.purchasePrice) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${(Number(newCreditSaleForm.sellingPrice) - Number(newCreditSaleForm.purchasePrice)).toLocaleString('es-CL')}
                  </span>
                </p>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fecha</label>
                <input type="date" value={newCreditSaleForm.purchaseDate}
                  onChange={e => setNewCreditSaleForm(p => ({ ...p, purchaseDate: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notas</label>
                <textarea rows={2} value={newCreditSaleForm.notes} onChange={e => setNewCreditSaleForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" placeholder="Opcional..." />
              </div>
              {creditSaleError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-sm text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{creditSaleError}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowNewCreditSaleModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-sm uppercase tracking-wider">Cancelar</button>
                <button type="submit" disabled={creditSaleSaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 rounded-sm uppercase tracking-wider">
                  {creditSaleSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agregar Abono Modal */}
      {showAddPaymentModal && selectedCreditSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-sm">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-black">Agregar Abono</h3>
              <button onClick={() => setShowAddPaymentModal(false)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <p className="text-xs text-gray-500">
                Saldo pendiente: <span className="font-bold text-black">${selectedCreditSale.balance.toLocaleString('es-CL')}</span>
              </p>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Monto *</label>
                <input type="number" min="0.01" step="0.01" required value={newPaymentForm.amount}
                  onChange={e => setNewPaymentForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fecha</label>
                <input type="date" value={newPaymentForm.paymentDate}
                  onChange={e => setNewPaymentForm(p => ({ ...p, paymentDate: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notas</label>
                <input type="text" value={newPaymentForm.notes} onChange={e => setNewPaymentForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Ej: Nequi, Efectivo..." />
              </div>
              {paymentError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-sm text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{paymentError}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddPaymentModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-sm uppercase tracking-wider">Cancelar</button>
                <button type="submit" disabled={paymentSaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 rounded-sm uppercase tracking-wider">
                  {paymentSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : 'Agregar Abono'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Product Detail Modal ─────────────────────────────────────── */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="text-xl font-extrabold text-black truncate">{detailProduct.name}</h3>
                {detailProduct.productCode && (
                  <span className="font-mono text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-sm tracking-widest">
                    #{detailProduct.productCode}
                  </span>
                )}
              </div>
              <button onClick={() => setDetailProduct(null)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {detailProduct.images?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {detailProduct.images.map((src, i) => (
                    <div key={i} className="w-20 h-28 border border-gray-100 rounded-sm overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img src={src.startsWith('http') ? src : `http://localhost:5173${src}`}
                        alt={`foto-${i+1}`} className="w-full h-full object-contain p-1" />
                    </div>
                  ))}
                </div>
              )}
              {([
                ['Fabricante',           detailProduct.manufacturer],
                ['Medidas',              (detailProduct as any).measurements],
                ['Descripción',          detailProduct.description],
                ['Descripción Detallada',(detailProduct as any).detailedDescription],
                ['Componentes',          (detailProduct as any).components],
                ['Materiales',           (detailProduct as any).materials],
                ['Color',                (detailProduct as any).color],
                ['Forma',                (detailProduct as any).shape],
                ['Diseño',               (detailProduct as any).design],
                ['Ocasión',              (detailProduct as any).occasion],
                ['Tamaño',               (detailProduct as any).size],
                ['Capacidad',            (detailProduct as any).capacity],
              ] as [string, string][]).filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-2 text-sm border-b border-gray-50 pb-2">
                  <span className="font-bold text-gray-400 uppercase text-xs tracking-wider">{label}</span>
                  <span className="col-span-2 text-gray-700 whitespace-pre-wrap">{value}</span>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-gray-50 rounded-sm p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Código</p>
                  <p className="font-mono text-sm font-bold text-black tracking-widest">#{detailProduct.productCode || '——'}</p>
                </div>
                <div className="bg-gray-50 rounded-sm p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Categoría</p>
                  <p className="text-sm font-semibold text-black">{categories.find(c => c.id === detailProduct.categoryId)?.name || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-sm p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stock</p>
                  <p className="text-sm font-semibold text-black">{detailProduct.stock}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => { setDetailProduct(null); openEditProduct(detailProduct); }}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold border border-gray-200 rounded-sm hover:bg-gray-50 uppercase tracking-wider">
                <Edit className="w-4 h-4" /> Editar
              </button>
              <button onClick={() => setDetailProduct(null)}
                className="px-5 py-2.5 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-sm uppercase tracking-wider">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Product Edit Modal ───────────────────────────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="text-xl font-extrabold text-black">Editar Producto</h3>
                {editingProduct?.productCode && (
                  <span className="font-mono text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-sm tracking-widest">
                    #{editingProduct.productCode}
                  </span>
                )}
              </div>
              <button type="button" onClick={() => { editImagePreviews.forEach(u => URL.revokeObjectURL(u)); setEditImageFiles([]); setEditImagePreviews([]); setEditExistingImages([]); setEditingProduct(null); }} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateProduct} className="overflow-y-auto flex-1 flex flex-col">
              <div className="p-6 space-y-6 flex-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">Información Básica</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre *</label>
                      <input type="text" required value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fabricante</label>
                        <input type="text" value={editForm.manufacturer} onChange={e => setEditForm(p => ({ ...p, manufacturer: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Medidas</label>
                        <input type="text" value={editForm.measurements} onChange={e => setEditForm(p => ({ ...p, measurements: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descripción</label>
                      <textarea rows={2} value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descripción Detallada</label>
                      <textarea rows={3} value={editForm.detailedDescription} onChange={e => setEditForm(p => ({ ...p, detailedDescription: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Componentes</label>
                        <textarea rows={2} value={editForm.components} onChange={e => setEditForm(p => ({ ...p, components: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Materiales</label>
                        <textarea rows={2} value={editForm.materials} onChange={e => setEditForm(p => ({ ...p, materials: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">Estilo y Clasificación</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {([
                      ['Color','color'],['Forma','shape'],['Diseño','design'],
                      ['Ocasión','occasion'],['Tamaño','size'],['Capacidad','capacity'],
                    ] as [string, keyof typeof editForm][]).map(([label, field]) => (
                      <div key={field}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                        <input type="text" value={editForm[field]} onChange={e => setEditForm(p => ({ ...p, [field]: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Categoría *</label>
                      <select required value={editCatId} onChange={e => { setEditCatId(e.target.value); setEditBrandId(''); setEditTypeId(''); setEditSubTypeId(''); }}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                        <option value="">— Selecciona —</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Marca</label>
                      <select value={editBrandId} onChange={e => { setEditBrandId(e.target.value); setEditTypeId(''); setEditSubTypeId(''); }} disabled={!editCatId}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white disabled:bg-gray-50 disabled:text-gray-400">
                        <option value="">— Selecciona —</option>
                        {editBrandsForCat.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tipo</label>
                      <select value={editTypeId} onChange={e => { setEditTypeId(e.target.value); setEditSubTypeId(''); }} disabled={!editBrandId}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white disabled:bg-gray-50 disabled:text-gray-400">
                        <option value="">— Selecciona —</option>
                        {editTypesForBrand.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">SubTipo</label>
                      <select value={editSubTypeId} onChange={e => setEditSubTypeId(e.target.value)} disabled={!editTypeId}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white disabled:bg-gray-50 disabled:text-gray-400">
                        <option value="">— Selecciona —</option>
                        {editSubTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">Imágenes</h4>
                  <div className="space-y-3">
                    {editExistingImages.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Imágenes actuales (hover para eliminar)</p>
                        <div className="flex flex-wrap gap-2">
                          {editExistingImages.map((src, i) => (
                            <div key={i} className="relative w-20 h-[5.5rem] border border-gray-200 rounded-sm overflow-hidden bg-gray-50 group">
                              <img src={src.startsWith('http') ? src : `http://localhost:5173${src}`}
                                alt={`img-${i+1}`} className="w-full h-full object-contain p-1" />
                              <button type="button"
                                onClick={() => setEditExistingImages(prev => prev.filter((_, j) => j !== i))}
                                className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Agregar nuevas imágenes</p>
                      <div className="flex flex-wrap gap-2">
                        {editImagePreviews.map((src, i) => (
                          <div key={i} className="relative w-20 h-[5.5rem] border border-gray-200 rounded-sm overflow-hidden bg-gray-50 group">
                            <img src={src} alt={`nueva-${i+1}`} className="w-full h-full object-contain p-1" />
                            <button type="button"
                              onClick={() => {
                                URL.revokeObjectURL(editImagePreviews[i]);
                                const nextFiles = editImageFiles.filter((_, j) => j !== i);
                                setEditImageFiles(nextFiles);
                                setEditImagePreviews(nextFiles.map(f => URL.createObjectURL(f)));
                              }}
                              className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {(editExistingImages.length + editImagePreviews.length) < 5 && (
                          <label className="w-20 h-[5.5rem] border-2 border-dashed border-gray-300 rounded-sm flex items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition-colors">
                            <Plus className="w-5 h-5 text-gray-400" />
                            <input type="file" accept="image/*" multiple className="hidden"
                              onChange={e => {
                                const files = Array.from(e.target.files ?? []);
                                const remaining = 5 - editExistingImages.length - editImageFiles.length;
                                const combined = [...editImageFiles, ...files].slice(0, remaining);
                                setEditImageFiles(combined);
                                setEditImagePreviews(combined.map(f => URL.createObjectURL(f)));
                                e.target.value = '';
                              }} />
                          </label>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Máx. 5 imágenes en total.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">Variantes de Color</h4>
                  <p className="text-xs text-gray-400 mb-3">
                    Vinculá este producto con otros colores del mismo ítem para que en la tienda se muestren como opciones seleccionables.
                  </p>
                  {editingProduct && (() => {
                    const brandNameOf = (p: ApiProduct) => {
                      const cat = categories.find(c => c.id === p.categoryId);
                      return cat?.brands.find(b => b.id === p.brandId)?.name ?? '';
                    };
                    const typeNameOf = (p: ApiProduct) => {
                      const cat = categories.find(c => c.id === p.categoryId);
                      const brand = cat?.brands.find(b => b.id === p.brandId);
                      return brand?.types.find(t => t.id === p.typeId)?.name ?? '';
                    };
                    const allBrandNames = Array.from(new Set(categories.flatMap(c => c.brands.map(b => b.name)))).sort();
                    const allTypeNames = Array.from(new Set(categories.flatMap(c => c.brands.flatMap(b => b.types.map(t => t.name))))).sort();

                    const linkedVariants = editingProduct.variantGroupId
                      ? products.filter(p => p.variantGroupId === editingProduct.variantGroupId && p.id !== editingProduct.id)
                      : [];
                    const q = variantSearch.trim().toLowerCase();
                    const candidates = products
                      .filter(p => {
                        if (p.id === editingProduct.id) return false;
                        // Excluir solo si ya está en el mismo grupo que el producto que estamos editando
                        // (si editingProduct no tiene grupo todavía, ningún candidato debe descartarse por esto).
                        if (editingProduct.variantGroupId != null && p.variantGroupId === editingProduct.variantGroupId) return false;
                        const pBrand = brandNameOf(p);
                        const pType  = typeNameOf(p);
                        if (variantBrandFilter && pBrand !== variantBrandFilter) return false;
                        if (variantTypeFilter && pType !== variantTypeFilter) return false;
                        if (q.length === 0) return true;
                        return p.name.toLowerCase().includes(q)
                          || pBrand.toLowerCase().includes(q)
                          || pType.toLowerCase().includes(q);
                      })
                      .sort((a, b) => {
                        const aSame = a.categoryId === editingProduct.categoryId ? 0 : 1;
                        const bSame = b.categoryId === editingProduct.categoryId ? 0 : 1;
                        return aSame - bSame || a.name.localeCompare(b.name);
                      })
                      .slice(0, 30);
                    return (
                      <div className="space-y-3">
                        {linkedVariants.length > 0 && (
                          <div className="space-y-2">
                            {linkedVariants.map(v => (
                              <div key={v.id} className="flex items-center gap-3 border border-gray-200 rounded-sm p-2">
                                <img src={v.images?.[0]} alt="" className="w-10 h-10 object-cover rounded-sm bg-gray-100 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-black truncate">{v.name}</p>
                                  <p className="text-[11px] text-gray-400">{(v as any).color || 'Sin color'}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => unlinkVariant(v.id)}
                                  disabled={variantSavingId === v.id}
                                  className="text-[11px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 disabled:opacity-40 flex-shrink-0"
                                >
                                  {variantSavingId === v.id ? '...' : 'Quitar'}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <select
                            value={variantBrandFilter}
                            onChange={e => setVariantBrandFilter(e.target.value)}
                            className="flex-1 px-2 py-2 border border-gray-200 rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            <option value="">Todas las marcas</option>
                            {allBrandNames.map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                          <select
                            value={variantTypeFilter}
                            onChange={e => setVariantTypeFilter(e.target.value)}
                            className="flex-1 px-2 py-2 border border-gray-200 rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            <option value="">Todos los tipos</option>
                            {allTypeNames.map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <input
                          type="text"
                          value={variantSearch}
                          onChange={e => setVariantSearch(e.target.value)}
                          placeholder="Filtrar por nombre, marca o tipo… (dejalo vacío para ver todos)"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        {candidates.length > 0 ? (
                          <div className="space-y-1.5 max-h-72 overflow-y-auto border border-gray-100 rounded-sm p-2">
                            {candidates.map(c => (
                              <div key={c.id} className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-sm">
                                <img src={c.images?.[0]} alt="" className="w-9 h-9 object-cover rounded-sm bg-gray-100 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-black truncate">{c.name}</p>
                                  <p className="text-[11px] text-gray-400">{(c as any).color || 'Sin color'}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => linkVariant(c.id)}
                                  disabled={variantSavingId === c.id}
                                  className="text-[11px] font-bold uppercase tracking-wider text-black hover:opacity-60 disabled:opacity-40 flex-shrink-0"
                                >
                                  {variantSavingId === c.id ? '...' : 'Vincular'}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Sin resultados.</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">Precio al Público</h4>
                  <div className="flex gap-4 flex-wrap">
                    <div className="max-w-xs flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Precio de Venta
                        {editProductPLItems.length > 0 && (
                          <span className="ml-2 text-xs font-normal text-blue-500 normal-case tracking-normal">sincronizado con lista de precios</span>
                        )}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input type="number" min="0" step="1" value={editForm.sellingPrice}
                          onChange={e => {
                            setEditForm(p => ({ ...p, sellingPrice: e.target.value }));
                            if (editProductPLItems.length > 0) {
                              setEditProductPLForms(prev => {
                                const updated = { ...prev };
                                editProductPLItems.forEach(item => {
                                  updated[item.itemId] = { ...updated[item.itemId], sellingPrice: e.target.value };
                                });
                                return updated;
                              });
                            }
                          }}
                          className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="0" />
                      </div>
                    </div>
                    <div className="w-36">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descuento %</label>
                      <div className="relative">
                        <input type="number" min="0" max="100" step="1" value={editForm.discountPercentage}
                          onChange={e => setEditForm(p => ({ ...p, discountPercentage: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="0" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">Listas de Precios Vinculadas</h4>
                  {editProductPLLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />Cargando precios...
                    </div>
                  ) : editProductPLItems.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">Este producto no está en ninguna lista de precios.</p>
                  ) : (
                    <div className="space-y-4">
                      {editProductPLItems.map(item => {
                        const form = editProductPLForms[item.itemId] ?? { purchasePrice: '', sellingPrice: '', discountPercent: '0' };
                        const sp = Number(form.sellingPrice) || 0;
                        const dp = Number(form.discountPercent) || 0;
                        const fp = sp * (1 - dp / 100);
                        return (
                          <div key={item.itemId} className="border border-gray-200 rounded-sm p-4 bg-gray-50">
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">{item.priceListName}</p>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Precio Compra</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                  <input type="number" min="0" step="1" value={form.purchasePrice}
                                    onChange={e => setEditProductPLForms(prev => ({ ...prev, [item.itemId]: { ...prev[item.itemId], purchasePrice: e.target.value } }))}
                                    className="w-full pl-7 pr-2 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="0" />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Precio Venta</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                  <input type="number" min="0" step="1" value={form.sellingPrice}
                                    onChange={e => {
                                      setEditProductPLForms(prev => ({ ...prev, [item.itemId]: { ...prev[item.itemId], sellingPrice: e.target.value } }));
                                      setEditForm(prev => ({ ...prev, sellingPrice: e.target.value }));
                                    }}
                                    className="w-full pl-7 pr-2 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="0" />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Descuento %</label>
                                <input type="number" min="0" max="100" step="0.1" value={form.discountPercent}
                                  onChange={e => setEditProductPLForms(prev => ({ ...prev, [item.itemId]: { ...prev[item.itemId], discountPercent: e.target.value } }))}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="0" />
                              </div>
                            </div>
                            {dp > 0 && (
                              <p className="mt-2 text-xs text-gray-500">
                                Precio final: <span className="font-bold text-black">${fp.toFixed(2)}</span>
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
                {editError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-sm text-sm mb-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{editError}
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => { editImagePreviews.forEach(u => URL.revokeObjectURL(u)); setEditImageFiles([]); setEditImagePreviews([]); setEditExistingImages([]); setEditingProduct(null); }}
                    className="px-6 py-2.5 font-bold text-sm text-gray-600 hover:bg-gray-100 rounded-sm uppercase tracking-wider">Cancelar</button>
                  <button type="submit" disabled={editSaving}
                    className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 rounded-sm uppercase tracking-wider">
                    {editSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Customer Create / Edit Modal ────────────────────────────────── */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-xl font-extrabold text-black">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
              <button onClick={() => { setShowClientModal(false); setQuickAddCustomer(false); }} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveClient} className="overflow-y-auto flex-1 p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre *</label>
                  <input type="text" required value={clientForm.firstName}
                    onChange={e => setClientForm(p => ({ ...p, firstName: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Ej: Juan" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Apellido</label>
                  <input type="text" value={clientForm.lastName}
                    onChange={e => setClientForm(p => ({ ...p, lastName: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Ej: Pérez" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" value={clientForm.email}
                    onChange={e => setClientForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="correo@ejemplo.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Teléfono</label>
                  <input type="text" value={clientForm.phone}
                    onChange={e => setClientForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="+56 9 1234 5678" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dirección</label>
                  <input type="text" value={clientForm.address}
                    onChange={e => setClientForm(p => ({ ...p, address: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Av. Providencia 1234" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ciudad</label>
                  <input type="text" value={clientForm.city}
                    onChange={e => setClientForm(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Santiago" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notas</label>
                <textarea rows={3} value={clientForm.notes}
                  onChange={e => setClientForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  placeholder="Observaciones del cliente..." />
              </div>
              {editingClient && (
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</label>
                  <button type="button"
                    onClick={() => setClientForm(p => ({ ...p, isActive: !p.isActive }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${clientForm.isActive ? 'bg-black' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${clientForm.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm text-gray-600">{clientForm.isActive ? 'Activo' : 'Inactivo'}</span>
                </div>
              )}
              {clientError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-sm text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{clientError}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowClientModal(false); setQuickAddCustomer(false); }}
                  className="flex-1 py-2.5 font-bold text-sm text-gray-600 border border-gray-200 rounded-sm hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={clientSaving}
                  className="flex-1 py-2.5 font-bold text-sm text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 rounded-sm flex items-center justify-center gap-2">
                  {clientSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : editingClient ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Customer Detail Modal ──────────────────────────────────────── */}
      {detailClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-black">Perfil del Cliente</h3>
              <button onClick={() => setDetailClient(null)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl font-extrabold flex-shrink-0">
                  {detailClient.firstName[0]?.toUpperCase()}{detailClient.lastName[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-extrabold text-black">{detailClient.fullName}</p>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                    detailClient.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}>
                    {detailClient.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {detailClient.email && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0 pt-0.5">Email</span>
                    <span className="text-gray-700">{detailClient.email}</span>
                  </div>
                )}
                {detailClient.phone && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0 pt-0.5">Teléfono</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{detailClient.phone}</span>
                      <a href={`https://wa.me/${detailClient.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[#25D366] hover:text-[#128C7E]" title="Chat WhatsApp">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
                {(detailClient.address || detailClient.city) && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0 pt-0.5">Dirección</span>
                    <span className="text-gray-700">{[detailClient.address, detailClient.city].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {detailClient.notes && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0 pt-0.5">Notas</span>
                    <span className="text-gray-600 italic">{detailClient.notes}</span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0 pt-0.5">Registro</span>
                  <span className="text-gray-500">{new Date(detailClient.createdAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => { setDetailClient(null); openEditClient(detailClient); }}
                className="flex-1 py-2.5 text-sm font-bold text-black border border-black rounded-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                <Edit className="w-4 h-4" /> Editar
              </button>
              <button onClick={() => setDetailClient(null)}
                className="flex-1 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 rounded-sm hover:bg-gray-50">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Crear / Editar Transportadora ───────────────────────── */}
      {showCarrierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-black">
                {editingCarrier ? 'Editar Transportadora' : 'Nueva Transportadora'}
              </h3>
              <button onClick={() => setShowCarrierModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCarrier} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={carrierForm.name}
                  onChange={e => setCarrierForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Ej: Servientrega, Coordinadora, TCC"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Contacto / Información (opcional)
                </label>
                <input
                  type="text"
                  value={carrierForm.contactInfo}
                  onChange={e => setCarrierForm(p => ({ ...p, contactInfo: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Teléfono, email o URL de rastreo"
                />
              </div>
              {editingCarrier && (
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</label>
                  <button
                    type="button"
                    onClick={() => setCarrierForm(p => ({ ...p, isActive: !p.isActive }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${carrierForm.isActive ? 'bg-black' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${carrierForm.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm text-gray-600">{carrierForm.isActive ? 'Activa' : 'Inactiva'}</span>
                </div>
              )}
              {carrierError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-sm text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{carrierError}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCarrierModal(false)}
                  className="flex-1 py-2.5 font-bold text-sm text-gray-600 border border-gray-200 rounded-sm hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={carrierSaving}
                  className="flex-1 py-2.5 font-bold text-sm text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 rounded-sm flex items-center justify-center gap-2">
                  {carrierSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : editingCarrier ? 'Guardar cambios' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
