import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, User, MapPin, LogOut, Phone, Mail, ChevronDown, ChevronUp, Truck, Check } from 'lucide-react';
import { useCustomerAuthStore } from '../store/useCustomerAuthStore';

import { API } from '../config/api';

interface OrderItem {
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  trackingNumber?: string;
  carrier?: string;
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  'Procesando':     'bg-blue-100 text-blue-700',
  'Picking':        'bg-purple-100 text-purple-700',
  'Enviado':        'bg-indigo-100 text-indigo-700',
  'En Tránsito':    'bg-amber-100 text-amber-700',
  'Entregado':      'bg-green-100 text-green-700',
  'Cancelado':      'bg-red-100 text-red-700',
  'Pendiente Pago': 'bg-orange-100 text-orange-700',
};

const DELIVERY_STEPS = [
  { status: 'Procesando',  title: 'Pedido recibido',       desc: 'Recibimos tu pedido y estamos confirmándolo.' },
  { status: 'Picking',     title: 'Preparando pedido',     desc: 'Estamos alistando y empacando tus productos.' },
  { status: 'Enviado',     title: 'Enviado',               desc: 'Entregamos tu paquete a la transportadora.' },
  { status: 'En Tránsito', title: 'En camino',             desc: 'Tu paquete va en camino a tu dirección.' },
  { status: 'Entregado',   title: 'Entregado',             desc: '¡Tu pedido llegó! Gracias por comprar en OrigenAXM.' },
];

function DeliveryTimeline({ order }: { order: CustomerOrder }) {
  if (order.status === 'Cancelado') {
    return (
      <div className="bg-red-50 border border-red-100 rounded-sm px-4 py-3 text-sm text-red-700 font-medium">
        Este pedido fue cancelado.
      </div>
    );
  }

  const pendingPayment = order.status === 'Pendiente Pago';
  const current = pendingPayment ? 0 : Math.max(0, DELIVERY_STEPS.findIndex(s => s.status === order.status));
  const delivered = order.status === 'Entregado';

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Seguimiento de la entrega</p>
      <ol className="relative">
        {DELIVERY_STEPS.map((step, i) => {
          const done   = i < current || (delivered && i === current);
          const active = i === current && !delivered;
          const isLast = i === DELIVERY_STEPS.length - 1;
          const title  = i === 0 && pendingPayment ? 'Esperando pago' : step.title;
          const desc   = i === 0 && pendingPayment ? 'Tu pedido se procesará cuando se confirme el pago.' : step.desc;
          return (
            <li key={step.status} className="relative flex gap-3 pb-5 last:pb-0">
              {!isLast && (
                <span className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${i < current ? 'bg-black' : 'bg-gray-200'}`} />
              )}
              <span className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2
                ${done ? 'bg-black border-black text-white' : active ? 'bg-white border-black' : 'bg-white border-gray-200'}`}>
                {done
                  ? <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  : active && <span className="w-2 h-2 rounded-full bg-black animate-pulse" />}
              </span>
              <div className="min-w-0 -mt-0.5">
                <p className={`text-sm font-bold ${done || active ? 'text-black' : 'text-gray-400'}`}>
                  {title}
                  {i === 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      {new Date(order.orderDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </p>
                <p className={`text-xs ${done || active ? 'text-gray-500' : 'text-gray-300'}`}>{desc}</p>
                {step.status === 'Enviado' && order.trackingNumber && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-sky-700 bg-sky-50 border border-sky-100 rounded-sm px-2 py-1">
                    <Truck className="w-3.5 h-3.5" />
                    {order.carrier ? `${order.carrier} · ` : ''}Guía <span className="font-mono font-bold">{order.trackingNumber}</span>
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function Profile() {
  const navigate   = useNavigate();
  const customer   = useCustomerAuthStore((s) => s.customer);
  const isAuth     = useCustomerAuthStore((s) => s.isAuthenticated);
  const logout     = useCustomerAuthStore((s) => s.logout);

  const [orders,      setOrders]      = useState<CustomerOrder[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [activeTab,   setActiveTab]   = useState<'orders' | 'account'>('orders');

  useEffect(() => {
    if (!isAuth || !customer) { navigate('/login', { replace: true }); return; }
    fetch(`${API}/api/customers/${customer.id}/orders`)
      .then(r => r.ok ? r.json() : [])
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isAuth, customer, navigate]);

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  if (!customer) return null;

  const initial = customer.fullName.charAt(0).toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-extrabold text-xl">
                {initial}
              </div>
              <div>
                <h2 className="font-bold text-black leading-tight">{customer.fullName}</h2>
                <p className="text-xs text-gray-500">@{customer.username}</p>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-sm font-bold transition-colors ${activeTab === 'orders' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-black'}`}
              >
                <Package className="w-4 h-4" /> Mis Pedidos
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-sm font-bold transition-colors ${activeTab === 'account' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-black'}`}
              >
                <User className="w-4 h-4" /> Mi Cuenta
              </button>
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-red-600 transition-colors w-full text-sm font-medium">
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow min-w-0">

          {/* ── MIS PEDIDOS ── */}
          {activeTab === 'orders' && (
            <>
              <h1 className="text-2xl font-extrabold text-black mb-6">Mis Pedidos</h1>
              {loading ? (
                <div className="text-center py-16 text-gray-400">Cargando pedidos…</div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-sm border border-gray-100 p-12 text-center shadow-sm">
                  <Package className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No tienes pedidos aún</h3>
                  <p className="text-gray-400 text-sm mb-6">¡Explora nuestro catálogo y realiza tu primer pedido!</p>
                  <Link to="/catalog"
                    className="inline-flex items-center px-6 py-2.5 bg-black text-white text-sm font-bold rounded-sm hover:bg-gray-800 transition-colors">
                    Ir al Catálogo
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
                      {/* Order header */}
                      <button
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="font-mono font-extrabold text-black text-sm">{order.orderNumber}</span>
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {order.status}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(order.orderDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                          <span className="font-bold text-black text-sm">${order.totalAmount.toLocaleString('es-CO')}</span>
                          {expandedId === order.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {expandedId === order.id && (
                        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                          {/* Items */}
                          <div className="divide-y divide-gray-50">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center py-2 text-sm">
                                <div>
                                  <span className="font-medium text-black">{item.productName}</span>
                                  {item.productCode && <span className="text-xs text-gray-400 ml-2">({item.productCode})</span>}
                                  <span className="text-gray-400 ml-2">× {item.quantity}</span>
                                </div>
                                <span className="font-bold text-black">${item.subtotal.toLocaleString('es-CO')}</span>
                              </div>
                            ))}
                          </div>

                          {/* Línea de tiempo de la entrega */}
                          <div className="border-t border-gray-100 pt-4">
                            <DeliveryTimeline order={order} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── MI CUENTA ── */}
          {activeTab === 'account' && (
            <>
              <h1 className="text-2xl font-extrabold text-black mb-6">Mi Cuenta</h1>
              <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Nombre completo</p>
                    <p className="font-medium text-black">{customer.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Usuario</p>
                    <p className="font-medium text-black">@{customer.username}</p>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">Correo</p>
                        <p className="font-medium text-black text-sm">{customer.email}</p>
                      </div>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">Teléfono</p>
                        <p className="font-medium text-black text-sm">{customer.phone}</p>
                      </div>
                    </div>
                  )}
                  {customer.address && (
                    <div className="col-span-full flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">Dirección</p>
                        <p className="font-medium text-black text-sm">{customer.address}{customer.city ? `, ${customer.city}` : ''}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Para actualizar tus datos, comunícate con nosotros a través del <Link to="/contact" className="font-bold text-black hover:underline">formulario de contacto</Link>.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
