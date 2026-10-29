/**
 * Comprime imágenes en el navegador antes de subirlas a la API (y de ahí a R2).
 *
 * Los perfiles replican los límites de `UploadsController` en la API: si la imagen
 * llega como WebP dentro de ese tamaño, la API la guarda tal cual sin recomprimirla.
 * Si algo falla aquí, se devuelve el archivo original y la API lo procesa como siempre.
 */

export type ImageProfile = 'product' | 'banner' | 'promotion';

const PROFILES: Record<ImageProfile, { maxDimension: number; quality: number }> = {
  product:   { maxDimension: 1600, quality: 0.82 },
  banner:    { maxDimension: 2000, quality: 0.85 },
  promotion: { maxDimension: 1200, quality: 0.85 },
};

// Los GIF pueden ser animados: el canvas se quedaría solo con el primer cuadro.
const SKIP_TYPES = new Set(['image/gif']);

export async function compressImage(file: File, profile: ImageProfile): Promise<File> {
  if (!file.type.startsWith('image/') || SKIP_TYPES.has(file.type)) return file;
  if (typeof createImageBitmap !== 'function') return file;

  const { maxDimension, quality } = PROFILES[profile];

  try {
    // 'from-image' aplica la rotación EXIF de las fotos tomadas con el celular.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));

    // Navegadores sin codificador WebP devuelven PNG: en ese caso dejamos que la API convierta.
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'imagen';
    return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() });
  } catch {
    return file;
  }
}

export function compressImages(files: File[], profile: ImageProfile): Promise<File[]> {
  return Promise.all(files.map(f => compressImage(f, profile)));
}
