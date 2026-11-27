import type { PaymentMethod, SaleType } from './types';

export const inputClass =
  'w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400';
export const labelClass = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5';
export const primaryButton =
  'flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors';
export const secondaryButton =
  'flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50';

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'Nequi', label: 'Nequi' },
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Transferencia', label: 'Transferencia' },
  { value: 'Otro', label: 'Otro' },
];

/** Nombre para mostrar de cualquier medio de abono, incluido el de la tienda. */
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  Nequi: 'Nequi',
  Efectivo: 'Efectivo',
  Transferencia: 'Transferencia',
  Otro: 'Otro',
  DLocalGo: 'dLocal Go',
};

export const SALE_TYPE_LABEL: Record<SaleType, string> = {
  Normal: 'Normal',
  Bono: 'Bono Amazon',
  Devolucion: 'Devolución',
};

/** Convierte lo que se escribe en un campo de pesos ("150.000", "$150000") en número. */
export const parseMoney = (text: string) => Number(text.replace(/[^\d]/g, '')) || 0;
