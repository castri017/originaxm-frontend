/** Promoción tal como la devuelve la API (`/api/promotions`). */
export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  /** Porcentaje de descuento entero entre 1 y 99. */
  discountPercent: number;
  /** Fechas ISO 8601 (UTC). */
  startDate: string;
  endDate: string;
  isActive: boolean;
  /** Texto del botón del popup, p. ej. "Ver promoción". */
  ctaText: string;
  productIds: string[];
  createdAt: string;
}

/** Cuerpo para crear o editar una promoción. */
export type PromotionInput = Omit<Promotion, 'id' | 'createdAt'>;

export type PromotionStatus = 'active' | 'scheduled' | 'expired' | 'inactive';

export const PROMOTION_LIMITS = {
  minDiscount: 1,
  maxDiscount: 99,
  titleMaxLength: 80,
  descriptionMaxLength: 200,
  ctaMaxLength: 30,
} as const;

export const DEFAULT_CTA_TEXT = 'Ver promoción';
