import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryFilter } from "@/components/products/category-filter";
import { Pagination } from "@/components/products/pagination";
import {
  ProductGrid,
  ProductGridSkeleton,
} from "@/components/products/product-grid";
import { PAGE_SIZE, getCategories, getProducts } from "@/lib/api/dummyjson";
import { formatCategory } from "@/lib/format";
import { parseProductFilters } from "@/lib/products/search-params";

export const metadata: Metadata = {
  title: "Produkte",
  description:
    "Alle Produkte im Simple Shop – filtern nach Kategorie, suchen und entdecken.",
};

/**
 * PLP. Hero, Überschrift und Kategorie-Chips sind Teil der statischen Shell.
 * Alles, was von `searchParams` abhängt, liegt in <ProductList> hinter einer
 * Suspense-Boundary und streamt zur Request-Zeit – mit Skeleton als Fallback.
 */
export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <div className="flex flex-col gap-8">
      <Hero />

      <section aria-labelledby="shop-heading" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="shop-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Entdecke den Shop
          </h2>
          <Suspense fallback={<div className="skeleton h-4 w-40" />}>
            <ResultSummary searchParams={searchParams} />
          </Suspense>
        </div>

        <Suspense fallback={<div className="skeleton h-10 w-full rounded-full" />}>
          <Categories />
        </Suspense>

        <Suspense fallback={<ProductGridSkeleton count={PAGE_SIZE} />}>
          <ProductList searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section
      aria-label="Intro"
      className="grid overflow-hidden rounded-3xl bg-surface-elevated lg:grid-cols-[1.1fr_1fr]"
    >
      <div className="flex flex-col justify-center gap-4 px-6 py-10 sm:px-10 lg:py-16">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-ink-muted">
          Weniger suchen. Mehr finden.
        </p>
        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-brand-800 sm:text-5xl lg:text-6xl">
          Lieblingsstücke.
          <br />
          Für deinen Alltag.
        </h1>
        <p className="text-lg text-ink-muted">
          Bewusst ausgewählt. Schön gemacht. Für dich.
        </p>
        <a
          href="#shop-heading"
          className="group mt-2 inline-flex items-center gap-3 text-sm font-medium"
        >
          <span aria-hidden className="transition group-hover:translate-x-1">
            ⟶
          </span>
          Unsere Auswahl entdecken
        </a>
      </div>
      <div
        aria-hidden
        className="relative hidden min-h-64 bg-gradient-to-br from-brand-100 via-cream to-surface-muted lg:block"
      >
        <span className="absolute right-6 top-6 rounded-md border border-brand-700/40 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-brand-800">
          Die simple Auswahl
        </span>
        <span className="absolute bottom-8 left-10 size-40 rounded-full bg-brand-700/10 blur-2xl" />
        <span className="absolute right-16 top-20 size-56 rounded-full bg-accent/10 blur-3xl" />
      </div>
    </section>
  );
}

async function Categories() {
  const categories = await getCategories();
  return <CategoryFilter categories={categories} />;
}

async function ResultSummary({
  searchParams,
}: Pick<PageProps<"/products">, "searchParams">) {
  const filters = parseProductFilters(await searchParams);
  const { total } = await getProducts(filters);

  return (
    <p className="text-sm text-ink-muted">
      <span className="font-semibold text-ink">{total}</span>{" "}
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
  );
}

async function ProductList({
  searchParams,
}: Pick<PageProps<"/products">, "searchParams">) {
  const filters = parseProductFilters(await searchParams);
  // Derselbe Aufruf wie in <ResultSummary>: "use cache" dedupliziert den Request.
  const { products, total } = await getProducts(filters);

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(filters.page, lastPage);
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="flex flex-col gap-8">
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState hasFilters={Boolean(filters.q || filters.category)} />
      )}

      {total > 0 && (
        <div className="grid items-center gap-4 border-t border-border pt-6 sm:grid-cols-[1fr_auto_1fr]">
          <p className="text-sm text-ink-muted">
            Du siehst {from}–{to} von {total} Produkten
          </p>
          <Pagination filters={filters} total={total} pageSize={PAGE_SIZE} />
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-3xl bg-surface-elevated px-6 py-20 text-center">
      <p className="text-xl font-semibold">Keine Produkte gefunden</p>
      <p className="mt-2 text-ink-muted">
        {hasFilters
          ? "Versuche einen anderen Suchbegriff oder eine andere Kategorie."
          : "Aktuell sind keine Produkte verfügbar."}
      </p>
    </div>
  );
}
