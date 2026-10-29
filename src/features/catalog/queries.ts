import { useQuery, type QueryClient } from '@tanstack/react-query';
import { catalogApi, NotFoundError } from './api';
import type { CatalogProduct } from './types';

/**
 * Datos públicos del catálogo con caché compartida entre páginas: ir de Inicio al
 * Catálogo o a una ficha no vuelve a descargar lo que ya se tiene. Todas las llaves
 * empiezan por 'catalog' para invalidarlas juntas cuando el admin cambia algo.
 */
export const catalogKeys = {
  all:         ['catalog'] as const,
  products:    () => [...catalogKeys.all, 'products'] as const,
  product:     (id: string) => [...catalogKeys.all, 'product', id] as const,
  variants:    (id: string) => [...catalogKeys.all, 'variants', id] as const,
  categories:  () => [...catalogKeys.all, 'categories'] as const,
  recommended: () => [...catalogKeys.all, 'recommended'] as const,
  featured:    () => [...catalogKeys.all, 'featured'] as const,
  banners:     () => [...catalogKeys.all, 'banners'] as const,
};

// La API cachea el catálogo; refrescar cada 10 min con la pestaña visible es suficiente.
const BACKGROUND_REFRESH_MS = 10 * 60 * 1000;

export const useProducts = () =>
  useQuery({
    queryKey: catalogKeys.products(),
    queryFn: ({ signal }) => catalogApi.products(signal),
    refetchInterval: BACKGROUND_REFRESH_MS,
  });

export const useCategories = () =>
  useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: ({ signal }) => catalogApi.categories(signal),
    staleTime: 30 * 60 * 1000,
  });

export const useRecommended = () =>
  useQuery({
    queryKey: catalogKeys.recommended(),
    queryFn: ({ signal }) => catalogApi.recommended(signal),
    refetchInterval: BACKGROUND_REFRESH_MS,
  });

export const useFeatured = () =>
  useQuery({
    queryKey: catalogKeys.featured(),
    queryFn: ({ signal }) => catalogApi.featured(signal),
    refetchInterval: BACKGROUND_REFRESH_MS,
  });

export const useBanners = () =>
  useQuery({
    queryKey: catalogKeys.banners(),
    queryFn: ({ signal }) => catalogApi.banners(signal),
    staleTime: 30 * 60 * 1000,
  });

/** Busca el producto en cualquier lista ya cargada (catálogo, destacados, variantes…). */
function findCachedProduct(client: QueryClient, id: string): CatalogProduct | undefined {
  const productLists = new Set(['products', 'recommended', 'featured', 'variants']);
  const lists = client.getQueriesData<CatalogProduct[]>({
    predicate: q => q.queryKey[0] === 'catalog' && productLists.has(String(q.queryKey[1])),
  });
  for (const [, data] of lists) {
    if (Array.isArray(data)) {
      const hit = data.find(p => p.id === id);
      if (hit) return hit;
    }
  }
  return undefined;
}

export const productQuery = (client: QueryClient, id: string) => ({
  queryKey: catalogKeys.product(id),
  queryFn: ({ signal }: { signal: AbortSignal }) => catalogApi.product(id, signal),
  // Si el producto ya vino en una lista, la ficha se pinta al instante y se refresca en segundo plano.
  placeholderData: () => findCachedProduct(client, id),
  retry: (count: number, error: Error) => !(error instanceof NotFoundError) && count < 2,
});

export const variantsQuery = (client: QueryClient, id: string) => ({
  queryKey: catalogKeys.variants(id),
  queryFn: async ({ signal }: { signal: AbortSignal }) => {
    const variants = await catalogApi.variants(id, signal);
    // Todas las variantes comparten la misma lista: al cambiar de color no hay que pedirla otra vez.
    for (const v of variants) {
      if (v.id !== id) client.setQueryData(catalogKeys.variants(v.id), variants);
    }
    return variants;
  },
});

/** Precarga la ficha al pasar el mouse o tocar una tarjeta, antes del clic. */
export function prefetchProduct(client: QueryClient, id: string) {
  void client.prefetchQuery(productQuery(client, id));
  void client.prefetchQuery(variantsQuery(client, id));
}
