import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryFilter } from "@/components/products/category-filter";
import { Pagination } from "@/components/products/pagination";
import {
  ProductGrid,
  ProductGridSkeleton,
} from "@/components/products/product-grid";
import { SearchBox } from "@/components/products/search-box";
import { PAGE_SIZE, getCategories, getProducts } from "@/lib/api/dummyjson";
import { formatCategory } from "@/lib/format";
import { parseProductFilters } from "@/lib/products/search-params";

export const metadata: Metadata = {
  title: "Produkte",
  description: "Alle Produkte im Simple Shop – filtern nach Kategorie und suchen.",
};

/**
 * PLP. Die Seite selbst ist statisch (App Shell). Alles, was von
 * `searchParams` abhängt, liegt in <ProductList> hinter einer Suspense-Boundary
 * und streamt zur Request-Zeit – mit Skeleton als Fallback.
 */
export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Produkte</h1>
        {/* useSearchParams() in Client Components braucht eine Suspense-Boundary */}
        <Suspense fallback={<div className="skeleton h-10 w-full sm:max-w-sm" />}>
          <SearchBox />
        </Suspense>
      </div>

      <Suspense fallback={<div className="skeleton h-9 w-full" />}>
        <Categories />
      </Suspense>

      <Suspense fallback={<ProductGridSkeleton count={PAGE_SIZE} />}>
        <ProductList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Categories() {
  const categories = await getCategories();
  return <CategoryFilter categories={categories} />;
}

async function ProductList({
  searchParams,
}: Pick<PageProps<"/products">, "searchParams">) {
  const filters = parseProductFilters(await searchParams);
  const { products, total } = await getProducts(filters);

  const hasFilters = Boolean(filters.q || filters.category);

  return (
    <section aria-labelledby="results-heading" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-ink-muted">
        <p id="results-heading">
          <span className="font-medium text-ink">{total}</span>{" "}
          {total === 1 ? "Produkt" : "Produkte"}
          {filters.category && (
            <>
              {" "}
              in <span className="text-ink">{formatCategory(filters.category)}</span>
            </>
          )}
          {filters.q && (
            <>
              {" "}
              für <span className="text-ink">„{filters.q}“</span>
            </>
          )}
        </p>
        {total > PAGE_SIZE && (
          <p>
            Seite {Math.min(filters.page, Math.ceil(total / PAGE_SIZE))} von{" "}
            {Math.ceil(total / PAGE_SIZE)}
          </p>
        )}
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState hasFilters={hasFilters} />
      )}

      <Pagination filters={filters} total={total} pageSize={PAGE_SIZE} />
    </section>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <p className="text-lg font-medium">Keine Produkte gefunden</p>
      <p className="mt-1 text-sm text-ink-muted">
        {hasFilters
          ? "Versuche einen anderen Suchbegriff oder eine andere Kategorie."
          : "Aktuell sind keine Produkte verfügbar."}
      </p>
    </div>
  );
}
