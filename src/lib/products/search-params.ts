import { localePath, type Locale } from "@/lib/i18n/config";

/**
 * Filter-, Sortier- und Pagination-State der PLP lebt vollständig in der URL
 * (Deep-Links). Hier wird er geparst, validiert und wieder serialisiert.
 */

export const SORT_OPTIONS = [
  "recommended",
  "price-asc",
  "price-desc",
  "rating-desc",
  "title-asc",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export interface ProductFilters {
  page: number;
  category: string | undefined;
  q: string | undefined;
  sort: SortOption;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

const MAX_QUERY_LENGTH = 100;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isSortOption(value: string): value is SortOption {
  return (SORT_OPTIONS as readonly string[]).includes(value);
}

export function parseProductFilters(raw: RawSearchParams): ProductFilters {
  const pageNum = Number.parseInt(first(raw.page) ?? "1", 10);
  const page = Number.isFinite(pageNum) && pageNum >= 1 ? pageNum : 1;

  const category = first(raw.category)?.trim() || undefined;
  const q = first(raw.q)?.trim().slice(0, MAX_QUERY_LENGTH) || undefined;

  const rawSort = first(raw.sort) ?? "";
  const sort: SortOption = isSortOption(rawSort) ? rawSort : "recommended";

  return { page, category, q, sort };
}

/** Sort-Option → DummyJSON-Parameter (`sortBy`, `order`). */
export function sortToApi(
  sort: SortOption,
): { sortBy: string; order: "asc" | "desc" } | undefined {
  switch (sort) {
    case "price-asc":
      return { sortBy: "price", order: "asc" };
    case "price-desc":
      return { sortBy: "price", order: "desc" };
    case "rating-desc":
      return { sortBy: "rating", order: "desc" };
    case "title-asc":
      return { sortBy: "title", order: "asc" };
    default:
      return undefined;
  }
}

/** Baut eine /products-URL. Defaults (Seite 1, "recommended") werden nicht serialisiert. */
export function buildProductsHref(
  locale: Locale,
  filters: Partial<ProductFilters>,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.sort && filters.sort !== "recommended") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));

  const qs = params.toString();
  return localePath(locale, qs ? `/products?${qs}` : "/products");
}
