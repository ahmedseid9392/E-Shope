type SaleFields = {
  price: number;
  sale_price: number | null;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
};

/**
 * Whether a product's sale price should currently be shown. Checks not just
 * that a sale_price exists, but that "now" actually falls inside the
 * scheduled window (FR-12e) — a sale_price alone doesn't mean the discount
 * is active yet, or still active.
 */
export function isOnSale(product: SaleFields): boolean {
  if (product.sale_price == null) return false;
  if (product.sale_price >= product.price) return false;

  const now = Date.now();

  if (product.sale_starts_at && new Date(product.sale_starts_at).getTime() > now) {
    return false;
  }
  if (product.sale_ends_at && new Date(product.sale_ends_at).getTime() < now) {
    return false;
  }
  return true;
}
