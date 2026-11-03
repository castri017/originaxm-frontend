import type { CatalogCategory, CatalogProduct } from './types';

export interface ProductTypeGroup {
  /** id del tipo, o '' para productos sin tipo reconocido. */
  id: string;
  name: string;
  products: CatalogProduct[];
}

export interface ProductCategorySection {
  /** id de la categoría, o '' para productos sin categoría reconocida. */
  id: string;
  name: string;
  total: number;
  types: ProductTypeGroup[];
}

const collator = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });

/** Orden de nombre "natural": "Vitalis 2" antes que "Vitalis 10". */
const byName = (a: CatalogProduct, b: CatalogProduct) => collator.compare(a.name, b.name);

/**
 * Agrupa el catálogo por categoría y, dentro de cada una, por tipo, para que cada línea
 * de producto (p. ej. todos los Vitalis o todos los Moods) aparezca junta y no dispersa.
 *
 * - Las categorías y los tipos respetan el orden en que los devuelve la API (el que define el admin).
 * - Dentro de cada tipo los productos van por nombre, en orden natural.
 * - Lo que no encaje en el árbol de categorías va al final en "Otros", para no ocultar nada.
 */
export function groupProductsByCategory(
  products: CatalogProduct[],
  categories: CatalogCategory[],
): ProductCategorySection[] {
  const sections: ProductCategorySection[] = [];
  const placed = new Set<string>();

  for (const category of categories) {
    const inCategory = products.filter(p => p.categoryId === category.id);
    if (inCategory.length === 0) continue;

    const types: ProductTypeGroup[] = [];
    const seenTypes = new Set<string>();
    for (const brand of category.brands) {
      for (const type of brand.types) {
        if (seenTypes.has(type.id)) continue;
        seenTypes.add(type.id);
        const ofType = inCategory.filter(p => p.typeId === type.id).sort(byName);
        if (ofType.length > 0) types.push({ id: type.id, name: type.name, products: ofType });
      }
    }

    const untyped = inCategory.filter(p => !seenTypes.has(p.typeId)).sort(byName);
    if (untyped.length > 0) types.push({ id: '', name: 'Otros', products: untyped });

    inCategory.forEach(p => placed.add(p.id));
    sections.push({ id: category.id, name: category.name, total: inCategory.length, types });
  }

  const orphans = products.filter(p => !placed.has(p.id)).sort(byName);
  if (orphans.length > 0) {
    sections.push({
      id: '',
      name: 'Otros productos',
      total: orphans.length,
      types: [{ id: '', name: 'Otros', products: orphans }],
    });
  }

  return sections;
}
