export function getProductImageUrl(
  productId?: string | null,
  filename?: string | null,
  thumb?: string | null
): string | null {
  if (!productId || !filename) return null;
  const suffix = thumb ? (thumb.startsWith("?") ? thumb : `?thumb=${thumb}`) : "";
  return `/api/files/products/${productId}/${filename}${suffix}`;
}
