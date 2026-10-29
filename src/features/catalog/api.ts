import { API } from '../../config/api';
import type { Banner, CatalogCategory, CatalogProduct } from './types';

export class NotFoundError extends Error {
  constructor() {
    super('No encontrado');
    this.name = 'NotFoundError';
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API}${path}`, { signal });
  if (res.status === 404) throw new NotFoundError();
  if (!res.ok) throw new Error(`Error ${res.status} al consultar ${path}`);
  return res.json() as Promise<T>;
}

export const catalogApi = {
  products:   (signal?: AbortSignal) => getJson<CatalogProduct[]>('/api/products', signal),
  product:    (id: string, signal?: AbortSignal) => getJson<CatalogProduct>(`/api/products/${id}`, signal),
  variants:   (id: string, signal?: AbortSignal) => getJson<CatalogProduct[]>(`/api/products/${id}/variants`, signal),
  categories: (signal?: AbortSignal) => getJson<CatalogCategory[]>('/api/categories', signal),
  recommended:(signal?: AbortSignal) => getJson<CatalogProduct[]>('/api/recommended', signal),
  featured:   (signal?: AbortSignal) => getJson<CatalogProduct[]>('/api/featured', signal),
  banners:    (signal?: AbortSignal) => getJson<Banner[]>('/api/banners', signal),
};
