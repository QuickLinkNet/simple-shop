/**
 * Filter- und Pagination-State der PLP lebt vollständig in der URL (Deep-Links).
 * Hier wird er geparst, validiert und wieder serialisiert.
 */

export interface ProductFilters {
  page: number;
  category: string | undefined;
  q: string | undefined;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

const MAX_QUERY_LENGTH = 100;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseProductFilters(raw: RawSearchParams): ProductFilters {
  const pageNum = Number.parseInt(first(raw.page) ?? "1", 10);
  const page = Number.isFinite(pageNum) && pageNum >= 1 ? pageNum : 1;

  const category = first(raw.category)?.trim() || undefined;

  const q = first(raw.q)?.trim().slice(0, MAX_QUERY_LENGTH) || undefined;

  return { page, category, q };
}

/** Baut eine /products-URL. Seite 1 wird nicht serialisiert. */
export function buildProductsHref(filters: Partial<ProductFilters>): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));

  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}
