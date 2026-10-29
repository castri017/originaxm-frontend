/** Producto tal como lo devuelve la API pública (`ProductDto`). */
export interface CatalogProduct {
  id: string;
  productCode: string;
  name: string;
  description: string;
  detailedDescription?: string;
  components?: string;
  manufacturer: string;
  measurements?: string;
  materials?: string;
  color?: string;
  shape?: string;
  design?: string;
  occasion?: string;
  capacity?: string;
  size?: string;
  categoryId: string;
  brandId?: string;
  typeId: string;
  subTypeId: string;
  images: string[];
  sellingPrice: number;
  discountPercentage: number;
  /** Descuento final calculado por la API (incluye promociones vigentes). */
  effectiveDiscountPercentage?: number;
  stock: number;
  isRecommended?: boolean;
  recommendedOrder?: number;
  isFeatured?: boolean;
  featuredOrder?: number;
  isInternational?: boolean;
  variantGroupId?: string | null;
}

export interface CatalogSubType { id: string; name: string; }
export interface CatalogType    { id: string; name: string; subTypes: CatalogSubType[]; }
export interface CatalogBrand   { id: string; name: string; types: CatalogType[]; }
export interface CatalogCategory { id: string; name: string; brands: CatalogBrand[]; }

export interface Banner {
  id: string;
  imageUrl: string;
  sortOrder: number;
}
