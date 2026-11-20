export type SaleType = 'Normal' | 'Bono' | 'Devolucion';
export type CollectionMethod = 'Abonos' | 'Sistecredito';
export type VoucherStatus = 'Pendiente' | 'Recibido' | 'Usado';
export type PaymentMethod = 'Nequi' | 'Efectivo' | 'Transferencia' | 'Otro';
export type SaleStatus = 'AlDia' | 'Vencida' | 'Pagado' | 'Devolucion' | 'SinVender';
export type CustomerStatus = 'AlDia' | 'Vencida' | 'Pagado';

export interface CreditPayment {
  id: string;
  creditSaleId: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  notes: string | null;
  createdAt: string;
}

export interface CreditSale {
  id: string;
  productId: string | null;
  productName: string;
  productCode: string;
  productImage: string;
  customerId: string | null;
  customerName: string;
  type: SaleType;
  collectionMethod: CollectionMethod;
  voucherStatus: VoucherStatus | null;
  purchasePrice: number;
  sellingPrice: number;
  margin: number;
  marginPercent: number;
  purchaseDate: string;
  saleDate: string | null;
  dueDate: string | null;
  status: SaleStatus;
  daysOverdue: number;
  amountPaid: number;
  balance: number;
  isPaid: boolean;
  paymentCount: number;
}

export interface CreditSaleDetail extends CreditSale {
  notes: string;
  createdAt: string;
  updatedAt: string | null;
  payments: CreditPayment[];
}

export interface CreditStats {
  totalPurchased: number;
  totalCollected: number;
  totalCommittedSelling: number;
  profit: number;
  totalBalance: number;
  saleCount: number;
  paidCount: number;
  pendingCount: number;
  expectedProfit: number;
  overdueBalance: number;
  overdueCount: number;
  customersWithBalance: number;
  customersOverdue: number;
  sistecreditoPending: number;
  pendingVouchers: number;
  inventoryCount: number;
  inventoryCost: number;
  inventoryExpectedSale: number;
}

export interface CreditCustomer {
  key: string;
  customerId: string | null;
  customerName: string;
  totalSold: number;
  totalPaid: number;
  balance: number;
  overdueBalance: number;
  oldestPendingSaleDate: string | null;
  maxDaysOverdue: number;
  status: CustomerStatus;
  saleCount: number;
  pendingCount: number;
}

export interface CashMovement {
  date: string;
  kind: 'Compra' | 'GMF' | 'Abono';
  description: string;
  amount: number;
}

export interface CashAccount {
  name: string;
  initialBalance: number;
  startDate: string;
  gmfRate: number;
  purchasesOut: number;
  gmfOut: number;
  paymentsIn: number;
  expectedBalance: number;
  movements: CashMovement[];
}

/** Lo que se envía para crear o editar una venta. Fechas como "YYYY-MM-DD". */
export interface SaleInput {
  productId: string | null;
  productName: string | null;
  customerId: string | null;
  customerName: string | null;
  purchasePrice: number;
  sellingPrice: number;
  purchaseDate: string;
  saleDate: string | null;
  type: SaleType;
  collectionMethod: CollectionMethod;
  voucherStatus: VoucherStatus | null;
  notes: string;
}

export interface PaymentInput {
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  notes: string | null;
}

export interface ImportRow {
  productId: string | null;
  productName: string | null;
  customerName: string | null;
  purchasePrice: number;
  sellingPrice: number;
  purchaseDate: string | null;
  saleDate: string | null;
  type: SaleType;
  collectionMethod: CollectionMethod;
  amountPaid: number;
  notes: string | null;
}

export interface ImportResult {
  created: number;
  sold: number;
  unsold: number;
  returns: number;
  totalBalance: number;
}

/** Producto del catálogo, para elegirlo o relacionarlo con el Excel. */
export interface CatalogProductOption {
  id: string;
  name: string;
  productCode?: string;
}

/** Cliente registrado en la tienda. */
export interface RegisteredCustomer {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phone?: string;
}
