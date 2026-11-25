import Seo from '../../components/Seo';
import { RETURNS, SHIPPING, SITE } from '../../config/site';
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
  // El texto SEO escrito en el admin manda; si no hay, se genera con los datos del producto.
  const description = product.seoDescription?.trim() || clip(
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
    ...(product.weightGrams && {
      weight: { '@type': 'QuantitativeValue', value: product.weightGrams, unitCode: 'GRM' },
    }),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'COP',
      price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE.name },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: price >= SHIPPING.freeFrom ? 0 : SHIPPING.cost,
          currency: 'COP',
        },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'CO' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue', minValue: SHIPPING.handlingDays.min, maxValue: SHIPPING.handlingDays.max, unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue', minValue: SHIPPING.transitDays.min, maxValue: SHIPPING.transitDays.max, unitCode: 'DAY',
          },
          businessDays: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => `https://schema.org/${d}`),
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'CO',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: RETURNS.days,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
        merchantReturnLink: `${SITE.url}/shipping`,
      },
    },
    ...(reviews && reviews.count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(reviews.average.toFixed(1)),
        reviewCount: reviews.count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    // Google pide `review` junto con `aggregateRating`: se publican las reseñas aprobadas más recientes.
    ...(reviews && reviews.items.length > 0 && {
      review: reviews.items.slice(0, 5).map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.authorName },
        datePublished: r.createdAt.slice(0, 10),
        ...(r.comment?.trim() && { reviewBody: clip(r.comment, 500) }),
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
      })),
    }),
  };

  return (
    <Seo
      title={product.seoTitle?.trim() || product.name}
      description={description}
      path={path}
      image={images[0]}
      type="product"
      jsonLd={jsonLd}
    />
  );
}
