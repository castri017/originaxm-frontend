import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, Wallet, ArrowRight, X, UserCheck, Loader2, UserPlus, LogIn } from 'lucide-react';
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

const LETTERS_ONLY = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
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
  const missingForFreeShipping = Math.max(0, shippingThreshold - subtotal);

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

  // ── Modal de éxito ──────────────────────────────────────────────────────
  if (placedOrder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-charcoal-dark/70 p-4">
        <div className="bg-brand-sand shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="bg-brand-charcoal-dark text-brand-sand px-8 py-7 flex items-start gap-4">
            <CheckCircle className="w-7 h-7 text-brand-copper-light shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <h2 className="font-display font-extrabold text-[24px] tracking-[-0.02em]">¡Pedido registrado!</h2>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-brand-muted">
                Pedido <span className="text-brand-sand">{placedOrder.orderNumber}</span>
              </p>
            </div>
          </div>

          <div className="px-8 py-7 flex flex-col gap-7">
            <p className="text-[14px] text-brand-charcoal-light bg-white border border-brand-line px-4 py-3.5">
              Te enviamos un correo de confirmación a <strong className="text-brand-charcoal-dark">{placedOrder.customerEmail}</strong> con el resumen de tu pedido.
            </p>

            <div className="flex flex-col gap-3">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-muted">Productos</span>
              <div className="flex flex-col">
                {placedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 py-3 border-t border-brand-line">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-display font-semibold text-[14.5px] text-brand-charcoal-dark">{item.productName}</span>
                      <span className="font-mono text-[10.5px] text-brand-muted">
                        {item.productCode ? `#${item.productCode} · ` : ''}cant. {item.quantity} · ${item.unitPrice.toLocaleString('es-CL')}
                      </span>
                    </div>
                    <span className="font-display font-bold text-[15px] text-brand-charcoal-dark whitespace-nowrap">
                      ${item.subtotal.toLocaleString('es-CL')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-[14px] text-brand-charcoal-light">
                <span>Subtotal</span>
                <span>${placedOrder.subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-[14px] text-brand-charcoal-light">
                <span>Envío</span>
                {placedOrder.shipping === 0
                  ? <span className="text-brand-stock font-semibold">Gratis</span>
                  : <span>${placedOrder.shipping.toLocaleString('es-CL')}</span>}
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-brand-line">
                <span className="font-display font-bold text-[16px] text-brand-charcoal-dark">Total</span>
                <span className="font-display font-extrabold text-[26px] text-brand-charcoal-dark">${placedOrder.total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-brand-line p-4 flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-muted mb-1">Cliente</span>
                <span className="font-display font-bold text-[14.5px] text-brand-charcoal-dark">{placedOrder.customerName}</span>
                <span className="text-[13.5px] text-brand-charcoal-light">{placedOrder.customerEmail}</span>
                <span className="text-[13.5px] text-brand-charcoal-light">{placedOrder.customerPhone}</span>
              </div>
              <div className="bg-white border border-brand-line p-4 flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-muted mb-1">Dirección de envío</span>
                <span className="text-[13.5px] text-brand-charcoal-dark">{placedOrder.customerAddress}</span>
                <span className="text-[13.5px] text-brand-charcoal-light">{placedOrder.customerCity}, {placedOrder.customerDepartment}</span>
                {placedOrder.notes && <span className="text-[12.5px] text-brand-muted italic">{placedOrder.notes}</span>}
              </div>
            </div>

            {/* Registro / login — solo si no hay sesión activa */}
            {!isCustomerAuth && (
              <div className="bg-white border border-brand-line p-5 flex flex-col gap-3">
                <span className="font-display font-bold text-[15px] text-brand-charcoal-dark">¿Quieres guardar tu pedido en tu cuenta?</span>
                <span className="text-[13.5px] text-brand-charcoal-light">Crea una cuenta o inicia sesión para ver el historial de tus pedidos en cualquier momento.</span>
                <div className="flex flex-wrap gap-3 mt-1">
                  <button
                    onClick={() => navigate('/login', { state: { from: '/profile' } })}
                    className="flex items-center gap-2 px-5 py-3 min-h-[44px] bg-brand-charcoal-dark text-brand-sand font-display font-bold text-[13.5px] hover:bg-brand-charcoal transition-colors"
                  >
                    <UserPlus className="w-4 h-4" /> Crear cuenta
                  </button>
                  <button
                    onClick={() => navigate('/login', { state: { from: '/profile' } })}
                    className="flex items-center gap-2 px-5 py-3 min-h-[44px] border border-brand-charcoal-dark font-display font-bold text-[13.5px] hover:bg-brand-sand transition-colors"
                  >
                    <LogIn className="w-4 h-4" /> Iniciar sesión
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={() => navigate('/catalog')} className="btn-primary">
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Carrito vacío ────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center flex flex-col items-center gap-5">
        <h2 className="font-display font-extrabold text-[26px] tracking-[-0.02em] text-brand-charcoal-dark">No hay productos para comprar</h2>
        <Link to="/catalog" className="btn-ghost">Volver al catálogo</Link>
      </div>
    );
  }

  const fieldCls = (name: string) =>
    `w-full px-4 py-3.5 text-[15px] border bg-brand-sand outline-none transition-colors focus:border-brand-charcoal-dark ${errors[name] ? 'border-brand-copper-dark bg-white' : 'border-brand-line'}`;

  const labelCls = 'block font-mono text-[10px] uppercase tracking-[0.14em] text-brand-muted mb-2';

  return (
    <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

      {/* Pasos */}
      <div className="flex flex-col gap-4 mb-9">
        <h1 className="font-display font-extrabold text-[32px] sm:text-[38px] tracking-[-0.03em] text-brand-charcoal-dark">
          Finalizar compra
        </h1>
        <div className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-brand-muted">
          <span className="text-brand-charcoal-dark">1 · Datos</span>
          <span className="w-6 h-px bg-brand-line" />
          <span>2 · Pago</span>
          <span className="w-6 h-px bg-brand-line" />
          <span>3 · Confirmación</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-14 items-start">
        <div>
          <form id="checkout-form" onSubmit={handleCheckout} noValidate className="flex flex-col gap-10">

            {/* Contacto */}
            <div className="flex flex-col gap-5">
              <h2 className="font-display font-extrabold text-[22px] tracking-[-0.02em] text-brand-charcoal-dark pb-3 border-b border-brand-line">
                Información de contacto
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Nombre</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''))}
                    className={fieldCls('nombre')}
                    placeholder="Ingresa tu nombre"
                  />
                  {errors.nombre && <p className="text-brand-copper-dark text-[12.5px] mt-1.5">{errors.nombre}</p>}
                </div>
                <div>
                  <label className={labelCls}>Apellidos</label>
                  <input
                    type="text"
                    value={apellidos}
                    onChange={e => setApellidos(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''))}
                    className={fieldCls('apellidos')}
                    placeholder="Ingresa tus apellidos"
                  />
                  {errors.apellidos && <p className="text-brand-copper-dark text-[12.5px] mt-1.5">{errors.apellidos}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Correo electrónico</label>
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
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10.5px] text-brand-muted">Buscando…</span>
                    )}
                  </div>
                  {autoFilled && (
                    <p className="flex items-center gap-1.5 text-brand-stock text-[12.5px] mt-1.5 font-semibold">
                      <UserCheck className="w-3.5 h-3.5" /> Datos completados automáticamente
                    </p>
                  )}
                  {errors.email && <p className="text-brand-copper-dark text-[12.5px] mt-1.5">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Teléfono</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={fieldCls('telefono')}
                    placeholder="3001234567"
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {errors.telefono && <p className="text-brand-copper-dark text-[12.5px] mt-1.5">{errors.telefono}</p>}
                </div>
              </div>
            </div>

            {/* Envío */}
            <div className="flex flex-col gap-5">
              <h2 className="font-display font-extrabold text-[22px] tracking-[-0.02em] text-brand-charcoal-dark pb-3 border-b border-brand-line">
                Dirección de envío
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelCls}>Dirección</label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                    className={fieldCls('direccion')}
                    placeholder="Carrera, calle, número, apartamento"
                  />
                  {errors.direccion && <p className="text-brand-copper-dark text-[12.5px] mt-1.5">{errors.direccion}</p>}
                </div>
                <div>
                  <label className={labelCls}>Departamento</label>
                  <select
                    value={department}
                    onChange={e => { setDepartment(e.target.value); setCity(''); }}
                    className={fieldCls('department')}
                  >
                    <option value="">Selecciona tu departamento</option>
                    {COLOMBIA_DATA.map(d => (
                      <option key={d.department} value={d.department}>{d.department}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-brand-copper-dark text-[12.5px] mt-1.5">{errors.department}</p>}
                </div>
                <div>
                  <label className={labelCls}>Municipio / ciudad</label>
                  <select
                    disabled={!department}
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className={fieldCls('city') + ' disabled:bg-white disabled:text-brand-muted'}
                  >
                    <option value="">Selecciona tu municipio</option>
                    {cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.city && <p className="text-brand-copper-dark text-[12.5px] mt-1.5">{errors.city}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Notas del pedido (opcional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-4 py-3.5 text-[15px] border border-brand-line bg-brand-sand outline-none focus:border-brand-charcoal-dark transition-colors h-24 resize-none"
                    placeholder="Instrucciones adicionales para la entrega"
                  />
                </div>
              </div>
            </div>

            {/* Pago */}
            <div className="flex flex-col gap-5">
              <h2 className="font-display font-extrabold text-[22px] tracking-[-0.02em] text-brand-charcoal-dark pb-3 border-b border-brand-line">
                Método de pago
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { value: 'sistecredito', Icon: Wallet, label: 'Sistecredito', sub: 'Paga a cuotas sin interés (sujeto a aprobación)' },
                  { value: 'cod',          Icon: Truck,  label: 'Pago contra entrega', sub: 'Paga en efectivo al recibir tu pedido' },
                ].map(({ value, Icon, label, sub }) => (
                  <label key={value} className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${payment === value ? 'border-brand-charcoal-dark border-2 bg-white' : 'border-brand-line hover:bg-white'}`}>
                    <input type="radio" name="payment" value={value} checked={payment === value} onChange={() => setPayment(value)} className="mt-1 w-4 h-4 accent-[#1c1a16]" />
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 font-display font-bold text-[14.5px] text-brand-charcoal-dark">
                        <Icon className="w-4 h-4 text-brand-charcoal-light" /> {label}
                      </span>
                      <span className="text-[12.5px] text-brand-charcoal-light leading-snug">{sub}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Campos extra para Sistecredito */}
              {payment === 'sistecredito' && (
                <div className="pt-5 border-t border-brand-line grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <p className="sm:col-span-2 text-[13px] text-brand-charcoal-light bg-white px-4 py-3">
                    Sistecredito requiere tu número de documento para verificar tu crédito disponible.
                  </p>
                  <div>
                    <label className={labelCls}>Tipo de documento</label>
                    <select
                      value={docType}
                      onChange={e => setDocType(e.target.value)}
                      className="w-full px-4 py-3.5 text-[15px] border border-brand-line bg-brand-sand outline-none focus:border-brand-charcoal-dark transition-colors"
                    >
                      <option value="CC">Cédula de Ciudadanía (CC)</option>
                      <option value="TI">Tarjeta de Identidad (TI)</option>
                      <option value="CE">Cédula de Extranjería (CE)</option>
                      <option value="NIT">NIT</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Número de documento</label>
                    <input
                      type="text"
                      value={document}
                      onChange={e => setDocument(e.target.value.replace(/\D/g, ''))}
                      className={fieldCls('document')}
                      placeholder="1000000001"
                      inputMode="numeric"
                    />
                    {errors.document && <p className="text-brand-copper-dark text-[12.5px] mt-1.5">{errors.document}</p>}
                  </div>
                </div>
              )}
            </div>

            {paymentMsg && (
              <div className="bg-white border border-brand-line text-brand-charcoal px-4 py-3.5 text-[14px] flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> {paymentMsg}
              </div>
            )}

            {apiError && (
              <div className="bg-white border border-brand-copper-dark text-brand-copper-dark px-4 py-3.5 text-[14px] flex items-center gap-2.5">
                <X className="w-4 h-4 shrink-0" /> {apiError}
              </div>
            )}
          </form>
        </div>

        {/* Resumen */}
        <div className="bg-white border border-brand-line p-6 lg:p-7 sticky top-20 flex flex-col gap-6">
          <h2 className="font-display font-bold text-[18px] text-brand-charcoal-dark">Resumen del pedido</h2>

          {shipping > 0 && missingForFreeShipping > 0 && (
            <div className="flex flex-col gap-2">
              <div className="h-1 bg-brand-line relative">
                <div className="absolute left-0 top-0 bottom-0 bg-brand-stock" style={{ width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%` }} />
              </div>
              <span className="font-mono text-[10.5px] tracking-[0.06em] text-brand-stock">
                te faltan ${missingForFreeShipping.toLocaleString('es-CL')} para envío gratis
              </span>
            </div>
          )}

          <div className="flex flex-col gap-4 max-h-72 overflow-y-auto">
            {items.map(item => (
              <div key={`${item.product.id}-${item.size}`} className="flex items-start gap-3.5">
                <div className="relative flex-shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-16 h-20 object-contain bg-brand-sand" />
                  <span className="absolute -top-2 -right-2 bg-brand-charcoal-dark text-brand-sand font-mono text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="font-display font-semibold text-[14px] text-brand-charcoal-dark line-clamp-2">{item.product.name}</span>
                  {item.size && <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted">{item.size}</span>}
                </div>
                <span className="font-display font-bold text-[14.5px] text-brand-charcoal-dark whitespace-nowrap">
                  ${(item.product.price * item.quantity).toLocaleString('es-CL')}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 pt-5 border-t border-brand-line">
            <div className="flex justify-between text-[14px] text-brand-charcoal-light">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between text-[14px] text-brand-charcoal-light">
              <span>Envío</span>
              {shipping === 0 ? <span className="text-brand-stock font-semibold">Gratis</span> : <span>${shipping.toLocaleString('es-CL')}</span>}
            </div>
            <div className="flex justify-between items-baseline pt-3.5 border-t border-brand-line">
              <span className="font-display font-bold text-[16px] text-brand-charcoal-dark">Total</span>
              <span className="font-display font-extrabold text-[26px] text-brand-charcoal-dark">${total.toLocaleString('es-CL')}</span>
            </div>
          </div>

          <div className="bg-brand-sand px-4 py-3.5 flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-brand-muted">Tiempo de entrega</span>
            <span className="font-display font-bold text-[14.5px] text-brand-charcoal-dark">5 a 10 días hábiles</span>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="w-full min-h-[54px] bg-brand-charcoal-dark hover:bg-brand-charcoal disabled:bg-brand-muted text-brand-sand font-display font-bold text-[15px] flex items-center justify-center gap-2.5 transition-colors group"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando…</>
              : <>{payment === 'sistecredito' ? 'Pagar con Sistecredito' : payment === 'cod' ? 'Confirmar pedido' : 'Completar pedido'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
            }
          </button>
          <span className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-brand-muted">
            Pago 100% seguro encriptado
          </span>
        </div>
      </div>
    </div>
  );
}
