/**
 * Normaliza la URL de una imagen de producto o banner. Las de R2 llegan absolutas;
 * las antiguas son rutas relativas (`/uploads/...`) servidas por el mismo sitio.
 */
export function imageUrl(path: string | null | undefined): string {
  if (!path) return '';
  return path;
}
