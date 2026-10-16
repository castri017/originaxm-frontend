import type { Promotion, PromotionStatus } from './types';

/** Campos de precio que comparten producto de catálogo y ficha. */
interface PricedProduct {
  sellingPrice: number;
  discountPercentage?: number;
  /**
   * Descuento final calculado por la API: el mayor entre el descuento
   * propio del producto y el de sus promociones vigentes.
   */
  effectiveDiscountPercentage?: number;
}

/**
 * Descuento que se debe mostrar al cliente.
 * Si la API aún no envía `effectiveDiscountPercentage`, usa el descuento propio.
 */
export function getEffectiveDiscount(product: PricedProduct): number {
  return product.effectiveDiscountPercentage ?? product.discountPercentage ?? 0;
}

export function getFinalPrice(product: PricedProduct): number {
  const discount = getEffectiveDiscount(product);
  return discount > 0
    ? Math.round(product.sellingPrice * (1 - discount / 100))
    : product.sellingPrice;
}

export function getPromotionStatus(promotion: Promotion, now: Date = new Date()): PromotionStatus {
  if (!promotion.isActive) return 'inactive';
  if (now < new Date(promotion.startDate)) return 'scheduled';
  if (now > new Date(promotion.endDate)) return 'expired';
  return 'active';
}

/** Ruta a la que lleva el botón de la promoción. */
export function getPromotionTarget(promotion: Promotion): string {
  return promotion.productIds.length === 1
    ? `/product/${promotion.productIds[0]}`
    : `/catalog?promo=${promotion.id}`;
}
