const GUID_TAIL = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** "Termo Stanley Quencher 40 oz" → "termo-stanley-quencher-40-oz". */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

/** Ruta legible de un producto: `/product/termo-stanley-quencher-40-oz-<id>`. */
export function productPath(product: { id: string; name: string }): string {
  const slug = slugify(product.name);
  return slug ? `/product/${slug}-${product.id}` : `/product/${product.id}`;
}

/** Extrae el id del parámetro de la ruta; acepta tanto la URL legible como la antigua (solo id). */
export function productIdFromParam(param: string | undefined): string {
  if (!param) return '';
  return param.match(GUID_TAIL)?.[0] ?? param;
}
