import type { CatalogProductOption } from './types';

/**
 * Relaciona la descripción de un producto (como viene en el Excel, copiada de Amazon) con el
 * producto del catálogo que más se le parece. Compara palabras: modelo, tamaño en onzas y color.
 */

// Palabras que no ayudan a distinguir un producto de otro (marca, relleno, notas de pago).
const STOP_WORDS = new Set([
  'stanley', 'de', 'del', 'con', 'y', 'la', 'el', 'las', 'los', 'para', 'en', 'a', 'al', 'por', 'sin', 'un', 'una',
  'the', 'with', 'and', 'for', 'of',
  'nequi', 'bono', 'tc', 'gym', 'bpa', 'free',
]);

// Sinónimos frecuentes entre la descripción de Amazon (inglés o español) y el catálogo.
const SYNONYMS: Record<string, string> = {
  onzas: 'oz', onz: 'oz', ounce: 'oz', ounces: 'oz',
  vaso: 'tumbler', tumbler: 'tumbler',
  botella: 'bottle', bottle: 'bottle',
  taza: 'mug', mug: 'mug', jarra: 'mug',
  pajita: 'straw', pajilla: 'straw', popote: 'straw', paja: 'straw', straw: 'straw',
  negro: 'black', black: 'black', blanco: 'white', white: 'white', rosa: 'pink', pink: 'pink',
  rosado: 'pink', azul: 'blue', blue: 'blue', verde: 'green', green: 'green', rojo: 'red', red: 'red',
  plateado: 'silver', plata: 'silver', silver: 'silver', gris: 'gray', gray: 'gray', grey: 'gray',
  lila: 'lilac', lilac: 'lilac', amarillo: 'yellow', yellow: 'yellow', fucsia: 'fuchsia', fuchsia: 'fuchsia',
  vino: 'wine', wine: 'wine',
};

/** Pasa a minúsculas, quita tildes y signos, y une los tamaños ("30 onzas" → "30oz"). */
export function tokenize(text: string): string[] {
  const clean = text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/(\d+)\s*(oz|onzas|onz|ounces?)\b/g, ' $1oz ')
    .replace(/(\d)[.,](\d)/g, '$1p$2')   // "2.0" es versión, no dos números
    .replace(/[^a-z0-9]+/g, ' ');

  const tokens = clean.split(' ')
    .filter(Boolean)
    .map(t => SYNONYMS[t] ?? t)
    .filter(t => !STOP_WORDS.has(t) && (t.length > 1 || /\d/.test(t)));
  return [...new Set(tokens)];
}

// Palabras de categoría y colores: ayudan a desempatar, pero no bastan para decir que es el mismo producto.
const GENERIC = new Set([
  'tumbler', 'bottle', 'mug', 'straw', 'tapa', 'lid', 'asa', 'handle', 'flip', 'top', 'agua', 'water', 'vacio', 'vacuum',
  'black', 'white', 'pink', 'blue', 'green', 'red', 'silver', 'gray', 'lilac', 'yellow', 'fuchsia', 'claro', 'oscuro',
]);
const isSpecific = (t: string) => !/^\d+(oz|p\d+)?$/.test(t) && !GENERIC.has(t);

/** Las medidas pesan más: un 20 oz y un 30 oz no son el mismo termo aunque compartan modelo y color. */
const weight = (token: string) => (/^\d+oz$/.test(token) ? 3 : /^\d+$/.test(token) ? 1.5 : 1);

/** Similitud de 0 a 1 entre dos descripciones (coeficiente de Dice ponderado). */
export function similarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  const shared = a.filter(t => setB.has(t)).reduce((sum, t) => sum + weight(t), 0);
  const total = a.reduce((s, t) => s + weight(t), 0) + b.reduce((s, t) => s + weight(t), 0);
  let score = (2 * shared) / total;

  // Tallas distintas en los dos textos: casi seguro no es el mismo producto.
  const sizesA = a.filter(t => /^\d+oz$/.test(t));
  const sizesB = b.filter(t => /^\d+oz$/.test(t));
  if (sizesA.length && sizesB.length && !sizesA.some(s => sizesB.includes(s))) score *= 0.5;

  // Sin ninguna palabra propia en común (modelo como Vitalize, Quencher, IceFlow…), no es el mismo producto.
  if (!a.some(t => isSpecific(t) && setB.has(t))) score *= 0.4;
  return score;
}

export interface ProductMatch {
  product: CatalogProductOption;
  score: number;
}

/** Puntaje mínimo para relacionar un producto automáticamente; por debajo queda como texto libre. */
export const AUTO_MATCH_THRESHOLD = 0.45;

/** Los productos del catálogo ordenados del más parecido al menos parecido. */
export function rankProducts(description: string, products: CatalogProductOption[], limit = 5): ProductMatch[] {
  const tokens = tokenize(description);
  return products
    .map(product => ({ product, score: similarity(tokens, tokenize(product.name)) }))
    .filter(m => m.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit);
}

/** El producto que se relaciona solo, si se parece lo suficiente. */
export function bestMatch(description: string, products: CatalogProductOption[]): ProductMatch | null {
  const [top] = rankProducts(description, products, 1);
  return top && top.score >= AUTO_MATCH_THRESHOLD ? top : null;
}
