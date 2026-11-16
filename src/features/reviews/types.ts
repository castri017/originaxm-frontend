export type ReviewStatus = 'Pendiente' | 'Aprobada' | 'Rechazada';

/** Reseña aprobada, tal como la devuelve la API pública. */
export interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductReviews {
  average: number;
  count: number;
  /** Cantidad de reseñas por estrella, de 1★ a 5★. */
  distribution: number[];
  items: Review[];
}

export interface RatingSummary {
  productId: string;
  average: number;
  count: number;
}

export interface MyReview {
  id: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface ReviewEligibility {
  canReview: boolean;
  reason: 'NotPurchased' | 'AlreadyReviewed' | null;
  review: MyReview | null;
}

export interface AdminReview {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  authorName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  moderatedAt: string | null;
}

export const MAX_COMMENT_LENGTH = 1000;
