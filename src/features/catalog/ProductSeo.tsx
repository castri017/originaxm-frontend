import Seo from '../../components/Seo';
import { SITE } from '../../config/site';
import { imageUrl } from '../../lib/imageUrl';
import { productPath } from '../../lib/productUrl';
import { getFinalPrice } from '../promotions/pricing';
import { useProductReviews } from '../reviews/queries';
import type { CatalogProduct } from './types';

interface Props {
  product: CatalogProduct;
  brandName?: string;
  categoryName?: string;
}

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** Título, descripción, Open Graph y datos estructurados `Product` de la ficha. */
export default function ProductSeo({ product, brandName, categoryName }: Props) {
  const { data: reviews } = useProductReviews(product.id);

  const path = productPath(product);
  const url = `${SITE.url}${path}`;
  const images = product.images.map(imageUrl).filter(Boolean);
  const price = getFinalPrice(product);

  const details = [product.capacity, product.color].filter(Boolean).join(' · ');
  const baseDescription = product.description || product.detailedDescription || '';
  const description = clip(
    `${baseDescription} ${details ? `${details}. ` : ''}100% original, envío a todo Colombia.`,
    158,
  );

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    description: clip(product.detailedDescription || product.description || product.name, 500),
    sku: product.productCode,
    mpn: product.productCode,
    url,
    ...(images.length > 0 && { image: images }),
    ...((brandName || product.manufacturer) && {
      brand: { '@type': 'Brand', name: brandName || product.manufacturer },
    }),
    ...(categoryName && { category: categoryName }),
    ...(product.color && { color: product.color }),
    ...(product.materials && { material: product.materials }),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'COP',
      price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE.name },
    },
    ...(reviews && reviews.count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(reviews.average.toFixed(1)),
        reviewCount: reviews.count,
      },
    }),
  };

  return (
    <Seo
      title={product.name}
      description={description}
      path={path}
      image={images[0]}
      type="product"
      jsonLd={jsonLd}
    />
  );
}
