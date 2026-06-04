import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, Wallet, ArrowRight, X, Package, UserCheck, Loader2, UserPlus, LogIn, Clock } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useCatalogStore } from '../store/useCatalogStore';
import { useCustomerAuthStore } from '../store/useCustomerAuthStore';
import { COLOMBIA_DATA } from '../data/colombia';

import { API } from '../config/api';

interface PlacedOrder {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerDepartment: string;
  notes: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: { productName: string; productCode: string; quantity: number; unitPrice: number; subtotal: number }[];
}

const LETTERS_ONLY = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
const DIGITS_ONLY  = /^\d+$/;

export default function Checkout() {
  const navigate          = useNavigate();
  const items             = useCartStore((s) => s.items);
  const clearCart         = useCartStore((s) => s.clearCart);
  const subtotal          = useCartStore((s) => s.getTotals().subtotal);
  const invalidateCatalog = useCatalogStore((s) => s.invalidate);
  const customer          = useCustomerAuthStore((s) => s.customer);
  const isCustomerAuth    = useCustomerAuthStore((s) => s.isAuthenticated);

  // Form state
  const [nombre,     setNombre]     = useState('');
  const [apellidos,  setApellidos]  = useState('');
  const [email,      setEmail]      = useState('');
  const [telefono,   setTelefono]   = useState('');
  const [direccion,  setDireccion]  = useState('');
  const [department, setDepartment] = useState('');
  const [city,       setCity]       = useState('');
  const [notes,      setNotes]      = useState('');
  const [payment,    setPayment]    = useState('sistecredito');

  // Sistecredito: datos adicionales
  const [docType,       setDocType]       = useState('CC');
  const [document,      setDocument]      = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Async state
  const [loading,      setLoading]      = useState(false);
  const [apiError,     setApiError]     = useState('');
  const [placedOrder,  setPlacedOrder]  = useState<PlacedOrder | null>(null);
  const [autoFilled,   setAutoFilled]   = useState(false);
  const [lookingUp,    setLookingUp]    = useState(false);
  const [paymentMsg,   setPaymentMsg]   = useState('');   // mensaje durante el flujo Sistecredito

  async function handleEmailBlur() {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) return;
    setLookingUp(true);
    setAutoFilled(false);
    try {
      const res = await fetch(`${API}/api/customers?search=${encodeURIComponent(trimmed)}`);
      if (!res.ok) return;
      const list: any[] = await res.json();
      const match = list.find(c => c.email?.toLowerCase() === trimmed.toLowerCase());
      if (!match) return;

      setNombre(match.firstName ?? '');
      setApellidos(match.lastName ?? '');
      setTelefono(match.phone ?? '');
      setDireccion(match.address ?? '');

      if (match.city) {
        const dept = COLOMBIA_DATA.find(d =>
          d.cities.some(c => c.toLowerCase() === match.city.toLowerCase())
        );
        if (dept) {
          setDepartment(dept.department);
          setCity(dept.cities.find(c => c.toLowerCase() === match.city.toLowerCase()) ?? '');
        }
      }
      setAutoFilled(true);
    } catch {
      // silently ignore
    } finally {
      setLookingUp(false);
    }
  }

  const shippingThreshold   = 300000;
  const isLocalFreeShipping = department === 'Quindío' && city === 'Armenia';
  const shipping = (subtotal >= shippingThreshold || isLocalFreeShipping) ? 0 : 15000;
  const total    = subtotal + shipping;

  const cities = useMemo(() => {
    const dept = COLOMBIA_DATA.find(d => d.department === department);
    return dept ? dept.cities : [];
  }, [department]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!nombre.trim())                          e.nombre    = 'El nombre es requerido.';
    else if (!LETTERS_ONLY.test(nombre.trim()))  e.nombre    = 'Solo se permiten letras.';
    if (!apellidos.trim())                           e.apellidos = 'Los apellidos son requeridos.';
    else if (!LETTERS_ONLY.test(apellidos.trim()))   e.apellidos = 'Solo se permiten letras.';
    if (!email.trim())                           e.email     = 'El correo es requerido.';
    if (!telefono.trim())                        e.telefono  = 'El teléfono es requerido.';
    else if (!DIGITS_ONLY.test(telefono.trim())) e.telefono  = 'Solo se permiten números.';
    if (!direccion.trim())                       e.direccion = 'La dirección es requerida.';
    if (!department)                             e.department = 'Selecciona un departamento.';
    if (!city)                                   e.city      = 'Selecciona una ciudad.';

    if (payment === 'sistecredito') {
      if (!document.trim())                          e.document = 'El número de documento es requerido para Sistecredito.';
      else if (!DIGITS_ONLY.test(document.trim()))   e.document = 'Solo se permiten números.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Polling del estado de la transacción Sistecredito
  async function pollSistecreditoStatus(transactionId: string): Promise<string> {
    const maxAttempts = 20;
    const delayMs     = 3000;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, delayMs));
      setPaymentMsg(`Esperando confirmación de Sistecredito… (${i + 1}/${maxAttempts})`);

      const res = await fetch(`${API}/api/payments/sistecredito/status/${encodeURIComponent(transactionId)}`);
      if (!res.ok) continue;

      const data = await res.json();

      if (data.paymentRedirectUrl) return data.paymentRedirectUrl;

      // Si la transacción falló, salir del loop
      const failedStatuses = ['Rejected', 'Cancelled', 'Expired', 'Failed', 'Abandoned'];
      if (failedStatuses.includes(data.status)) {
        throw new Error(`El pago fue rechazado por Sistecredito (${data.status}). Intenta de nuevo.`);
      }
    }

    throw new Error('Tiempo de espera agotado. Intenta de nuevo.');
  }

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');
    setPaymentMsg('');

    try {
      const body = {
        customerName:       `${nombre.trim()} ${apellidos.trim()}`,
        customerEmail:      email.trim(),
        customerPhone:      telefono.trim(),
        customerDocument:   document.trim(),
        customerAddress:    direccion.trim(),
        customerCity:       city,
        customerDepartment: department,
        customerId:         customer?.id ?? null,
        notes:              notes.trim(),
        shipping,
        paymentMethod:      payment,
        items: items.map(item => ({
          productId:   item.product.id ?? null,
          productName: item.product.name,
          productCode: (item.product as any).productCode ?? '',
          quantity:    item.quantity,
          unitPrice:   item.product.price,
        })),
      };

      // 1. Crear el pedido en nuestro backend
      setPaymentMsg('Registrando pedido…');
      const res = await fetch(`${API}/api/orders`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Error ${res.status}`);
      }

      const created = await res.json();

      // 2. Flujo Sistecredito: crear transacción y redirigir
      if (payment === 'sistecredito') {
        setPaymentMsg('Iniciando pago con Sistecredito…');

        const payRes = await fetch(`${API}/api/payments/sistecredito/create`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            orderId:  created.id,
            docType:  docType,
            document: document.trim(),
          }),
        });

        const payData = await payRes.json();

        if (!payRes.ok) {
          throw new Error(payData.message ?? 'Error al iniciar el pago con Sistecredito.');
        }

        // Si ya tenemos la URL de redireccion
        if (payData.paymentRedirectUrl) {
          clearCart();
          invalidateCatalog();
          window.location.href = payData.paymentRedirectUrl;
          return;
        }

        // Hacer polling hasta obtener la URL
        const redirectUrl = await pollSistecreditoStatus(payData.transactionId);
        clearCart();
        invalidateCatalog();
        window.location.href = redirectUrl;
        return;
      }

      // 3. Otros métodos de pago: mostrar modal de éxito
      setPlacedOrder({
        orderNumber:        created.orderNumber,
        customerName:       body.customerName,
        customerEmail:      body.customerEmail,
        customerPhone:      body.customerPhone,
        customerAddress:    body.customerAddress,
        customerCity:       body.customerCity,
        customerDepartment: body.customerDepartment,
        notes:              body.notes,
        subtotal,
        shipping,
        total,
        items: items.map(item => ({
          productName: item.product.name,
          productCode: (item.product as any).productCode ?? '',
          quantity:    item.quantity,
          unitPrice:   item.product.price,
          subtotal:    item.product.price * item.quantity,
        })),
      });

      clearCart();
      invalidateCatalog();
    } catch (err: any) {
      setApiError(err.message ?? 'Error al registrar el pedido.');
    } finally {
      setLoading(false);
      setPaymentMsg('');
    }
  }

  // ── Success modal ─────────────────────────────────────────────────────────
  if (placedOrder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="bg-black text-white px-8 py-6 flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-green-400 shrink-0" />
            <div>
              <h2 className="text-xl font-extrabold tracking-wide">¡Pedido Registrado!</h2>
              <p className="text-gray-300 text-sm mt-0.5">Número de pedido: <span className="font-mono font-bold text-white">{placedOrder.orderNumber}</span></p>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            <p className="text-sm text-gray-600 bg-green-50 border border-green-200 rounded-sm px-4 py-3">
              Se ha enviado un correo de confirmación a <strong>{placedOrder.customerEmail}</strong> con el resumen de tu pedido.
            </p>

            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" /> Productos
              </h3>
              <div className="border border-gray-100 rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400">
                      <th className="px-4 py-2 text-left">Producto</th>
                      <th className="px-4 py-2 text-center">Cant.</th>
                      <th className="px-4 py-2 text-right">Precio</th>
                      <th className="px-4 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {placedOrder.items.map((item, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-black">{item.productName}</p>
                          {item.productCode && <p className="text-[11px] text-gray-400 font-mono">#{item.productCode}</p>}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-700">${item.unitPrice.toLocaleString('es-CL')}</td>
                        <td className="px-4 py-3 text-right font-bold text-black">${item.subtotal.toLocaleString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${placedOrder.subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                {placedOrder.shipping === 0
                  ? <span className="text-green-600 font-bold">Gratis</span>
                  : <span>${placedOrder.shipping.toLocaleString('es-CL')}</span>}
              </div>
              <div className="flex justify-between font-extrabold text-lg text-black border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span>${placedOrder.total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-sm p-4 space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Cliente</p>
                <p className="font-bold text-black">{placedOrder.customerName}</p>
                <p className="text-sm text-gray-600">{placedOrder.customerEmail}</p>
                <p className="text-sm text-gray-600">{placedOrder.customerPhone}</p>
              </div>
              <div className="bg-gray-50 rounded-sm p-4 space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Dirección de envío</p>
                <p className="text-sm text-black">{placedOrder.customerAddress}</p>
                <p className="text-sm text-gray-600">{placedOrder.customerCity}, {placedOrder.customerDepartment}</p>
                {placedOrder.notes && <p className="text-xs text-gray-400 italic">{placedOrder.notes}</p>}
              </div>
            </div>

            {/* Registro / login prompt — solo si no hay sesión activa */}
            {!isCustomerAuth && (
              <div className="bg-gray-50 border border-gray-200 rounded-sm p-5">
                <p className="text-sm font-bold text-black mb-1">¿Quieres guardar tu pedido en tu cuenta?</p>
                <p className="text-xs text-gray-500 mb-4">Crea una cuenta o inicia sesión para ver el historial de tus pedidos en cualquier momento.</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/login', { state: { from: '/profile' } })}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-extrabold uppercase tracking-wider rounded-sm hover:bg-gray-800 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Crear cuenta
                  </button>
                  <button
                    onClick={() => navigate('/login', { state: { from: '/profile' } })}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-xs font-extrabold uppercase tracking-wider rounded-sm hover:bg-gray-100 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Iniciar sesión
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => navigate('/catalog')}
                className="bg-black text-white text-sm font-extrabold uppercase tracking-widest px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4 text-black">No hay productos para comprar</h2>
        <Link to="/catalog" className="text-black font-bold uppercase tracking-wider text-sm hover:underline">Volver al catálogo</Link>
      </div>
    );
  }

  const fieldCls = (name: string) =>
    `w-full px-4 py-2 border rounded-sm outline-none transition-all focus:ring-1 focus:ring-black focus:border-black ${errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-black mb-8">Finalizar Compra</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3">
          <form id="checkout-form" onSubmit={handleCheckout} noValidate className="space-y-8">

            {/* Contact Info */}
            <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-black mb-4">Información de Contacto</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">Nombre</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))}
                    className={fieldCls('nombre')}
                    placeholder="Ingresa tu nombre"
                  />
                  {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">Apellidos</label>
                  <input
                    type="text"
                    value={apellidos}
                    onChange={e => setApellidos(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))}
                    className={fieldCls('apellidos')}
                    placeholder="Ingresa tus apellidos"
                  />
                  {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">Correo Electrónico</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setAutoFilled(false); }}
                      onBlur={handleEmailBlur}
                      className={fieldCls('email')}
                      placeholder="tu@email.com"
                    />
                    {lookingUp && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Buscando…</span>
                    )}
                  </div>
                  {autoFilled && (
                    <p className="flex items-center gap-1 text-green-600 text-xs mt-1 font-semibold">
                      <UserCheck className="w-3.5 h-3.5" /> Datos completados automáticamente
                    </p>
                  )}
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={fieldCls('telefono')}
                    placeholder="3001234567"
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
              <h2 className="text-xl font-extrabold text-black mb-6 uppercase tracking-tight">Dirección de Envío</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">Dirección</label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                    className={fieldCls('direccion')}
                    placeholder="Carrera, Calle, Número, Apartamento"
                  />
                  {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">Departamento</label>
                  <select
                    value={department}
                    onChange={e => { setDepartment(e.target.value); setCity(''); }}
                    className={fieldCls('department') + ' bg-white'}
                  >
                    <option value="">Selecciona tu departamento</option>
                    {COLOMBIA_DATA.map(d => (
                      <option key={d.department} value={d.department}>{d.department}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">Municipio / Ciudad</label>
                  <select
                    disabled={!department}
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className={fieldCls('city') + ' bg-white disabled:bg-gray-50 disabled:text-gray-400'}
                  >
                    <option value="">Selecciona tu municipio</option>
                    {cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">Notas del pedido (Opcional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all h-20 resize-none"
                    placeholder="Instrucciones adicionales para la entrega"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
              <h2 className="text-xl font-extrabold text-black mb-6 uppercase tracking-tight">Método de Pago</h2>
              <div className="space-y-3">
                {[
                  { value: 'sistecredito', Icon: Wallet, label: 'Sistecredito', sub: 'Paga a cuotas sin interés (sujeto a aprobación)' },
                  { value: 'cod',          Icon: Truck,  label: 'Pago Contra Entrega', sub: 'Paga en efectivo al recibir tu pedido' },
                ].map(({ value, Icon, label, sub }) => (
                  <label key={value} className={`flex items-center p-4 border rounded-sm cursor-pointer transition-all ${payment === value ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="payment" value={value} checked={payment === value} onChange={() => setPayment(value)} className="w-4 h-4 accent-black" />
                    <div className="ml-4 flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <span className={`font-bold text-sm uppercase tracking-wide block ${payment === value ? 'text-black' : 'text-gray-600'}`}>{label}</span>
                        {sub && <span className="text-[10px] text-gray-400 font-medium">{sub}</span>}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Código de referencia: prominente en transferencia, opcional en otros métodos */}
              {/* Campos extra para Sistecredito */}
              {payment === 'sistecredito' && (
                <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <p className="sm:col-span-2 text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-sm px-3 py-2">
                    Sistecredito requiere tu número de documento para verificar tu crédito disponible.
                  </p>
                  <div>
                    <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">Tipo de Documento</label>
                    <select
                      value={docType}
                      onChange={e => setDocType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-sm bg-white outline-none focus:ring-1 focus:ring-black focus:border-black"
                    >
                      <option value="CC">Cédula de Ciudadanía (CC)</option>
                      <option value="TI">Tarjeta de Identidad (TI)</option>
                      <option value="CE">Cédula de Extranjería (CE)</option>
                      <option value="NIT">NIT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">Número de Documento</label>
                    <input
                      type="text"
                      value={document}
                      onChange={e => setDocument(e.target.value.replace(/\D/g, ''))}
                      className={fieldCls('document')}
                      placeholder="1000000001"
                      inputMode="numeric"
                    />
                    {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Mensaje de estado de pago */}
            {paymentMsg && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-sm text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> {paymentMsg}
              </div>
            )}

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" /> {apiError}
              </div>
            )}
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-sm sticky top-24">
            <h2 className="text-xl font-bold text-black mb-6">Tu Pedido</h2>

            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3">
                  <div className="relative">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-20 object-cover rounded-sm" />
                    <span className="absolute -top-2 -right-2 bg-brand-charcoal-light text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-black line-clamp-1">{item.product.name}</p>
                    {item.size && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Talla: {item.size}</p>}
                  </div>
                  <div className="font-extrabold text-sm text-black text-right">
                    ${(item.product.price * item.quantity).toLocaleString('es-CL')}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 border-t border-gray-300 pt-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Envío</span>
                {shipping === 0 ? <span className="text-green-600 font-bold">Gratis</span> : <span>${shipping.toLocaleString('es-CL')}</span>}
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4 mb-6">
              <div className="flex justify-between font-extrabold text-xl text-black">
                <span>Total</span>
                <span>${total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 rounded-sm px-3 py-2 mb-6">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <p className="text-xs text-gray-500">Tiempo de entrega: <span className="font-bold text-black">5 a 10 días hábiles</span></p>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white text-sm font-extrabold uppercase tracking-[0.2em] py-4 px-6 rounded-full flex items-center justify-center transition-all shadow-md group"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando…</>
                : <>{payment === 'sistecredito' ? 'Pagar con Sistecredito' : payment === 'cod' ? 'Confirmar Pedido' : 'Completar Pedido'} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              }
            </button>
            <p className="text-[10px] text-center text-gray-400 mt-4 font-bold uppercase tracking-wider">
              Pago 100% seguro encriptado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
