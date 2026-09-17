import { cacheLife } from "next/cache";
import {
  PRODUCT_SUMMARY_FIELDS,
  type CategorySlug,
  type Product,
  type ProductListResponse,
  type ProductSummary,
} from "@/lib/types/product";

const BASE_URL = "https://dummyjson.com";

export const PAGE_SIZE = 20;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly url: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Typisierter Fetch-Wrapper.
 * Gibt `null` bei 404 zurück, wirft `ApiError` bei allen anderen Fehlern.
 */
async function request<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T | null> {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url);

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new ApiError(
      `DummyJSON request failed: ${res.status} ${res.statusText}`,
      res.status,
      url.toString(),
    );
  }

  return (await res.json()) as T;
}

const SUMMARY_SELECT = PRODUCT_SUMMARY_FIELDS.join(",");

export interface ProductQuery {
  page: number;
  category?: CategorySlug;
  q?: string;
}

/**
 * Produktliste für die PLP.
 *
 * DummyJSON kann Suche und Kategorie nicht kombinieren. Sind beide gesetzt,
 * wird die komplette Suchtreffermenge geladen (limit=0), serverseitig nach
 * Kategorie gefiltert und manuell paginiert. Die Datenmenge ist klein
 * (< 200 Produkte) und das Ergebnis wird gecacht – daher vertretbar.
 */
export async function getProducts(
  query: ProductQuery,
): Promise<ProductListResponse> {
  "use cache";
  cacheLife("hours");

  const { page, category, q } = query;
  const skip = (page - 1) * PAGE_SIZE;

  if (q && category) {
    const all = await request<ProductListResponse>("/products/search", {
      q,
      limit: 0,
      select: SUMMARY_SELECT,
    });
    const filtered = (all?.products ?? []).filter(
      (p) => p.category === category,
    );
    return {
      products: filtered.slice(skip, skip + PAGE_SIZE),
      total: filtered.length,
      skip,
      limit: PAGE_SIZE,
    };
  }

  const path = q
    ? "/products/search"
    : category
      ? `/products/category/${encodeURIComponent(category)}`
      : "/products";

  const data = await request<ProductListResponse>(path, {
    q,
    limit: PAGE_SIZE,
    skip,
    select: SUMMARY_SELECT,
  });

  return data ?? { products: [], total: 0, skip, limit: PAGE_SIZE };
}

/** Einzelnes Produkt, `null` wenn nicht vorhanden. */
export async function getProduct(id: number): Promise<Product | null> {
  "use cache";
  cacheLife("hours");

  return request<Product>(`/products/${id}`);
}

/** Alle Kategorie-Slugs. Ändern sich praktisch nie, daher langer Cache. */
export async function getCategories(): Promise<CategorySlug[]> {
  "use cache";
  cacheLife("days");

  return (await request<CategorySlug[]>("/products/category-list")) ?? [];
}

/** Produkte derselben Kategorie, ohne das aktuelle Produkt. */
export async function getRelatedProducts(
  category: CategorySlug,
  excludeId: number,
  limit = 4,
): Promise<ProductSummary[]> {
  "use cache";
  cacheLife("hours");

  const data = await request<ProductListResponse>(
    `/products/category/${encodeURIComponent(category)}`,
    { limit: limit + 1, select: SUMMARY_SELECT },
  );

  return (data?.products ?? [])
    .filter((p) => p.id !== excludeId)
    .slice(0, limit);
}

/** IDs der ersten Produkte für generateStaticParams (Build-Time-Prerender). */
export async function getProductIds(limit = 30): Promise<number[]> {
  "use cache";
  cacheLife("days");

  const data = await request<ProductListResponse<Pick<Product, "id">>>(
    "/products",
    { limit, select: "id" },
  );
  return (data?.products ?? []).map((p) => p.id);
}
