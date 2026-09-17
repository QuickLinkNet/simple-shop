import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSlider } from "@/components/layout/hero-slider";
import { Marquee } from "@/components/layout/marquee";
import { CategoryFilter } from "@/components/products/category-filter";
import { Pagination } from "@/components/products/pagination";
import {
  ProductGrid,
  ProductGridSkeleton,
} from "@/components/products/product-grid";
import { SearchBox } from "@/components/products/search-box";
import { SortSelect } from "@/components/products/sort-select";
import { PAGE_SIZE, getCategories, getProducts } from "@/lib/api/dummyjson";
import {
  type Dictionary,
  type Locale,
  categoryLabel,
  getDictionary,
  isLocale,
  plural,
  t,
} from "@/lib/i18n";
import { parseProductFilters } from "@/lib/products/search-params";

type Props = PageProps<"/[locale]/products">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "de");
  return {
    title: dict.meta.productsTitle,
    description: dict.meta.productsDescription,
  };
}

/**
 * PLP. Hero, Marquee, Überschrift und Kategorie-Chips sind Teil der
 * statischen Shell (pro Locale vorgerendert). Alles, was von `searchParams`
 * abhängt, liegt in <ProductList> hinter einer Suspense-Boundary und streamt
 * zur Request-Zeit.
 */
export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "de";
  const dict = getDictionary(locale);

  return (
    <div className="flex flex-col gap-8">
      <HeroSlider />
      {/* full-bleed: bricht bewusst aus dem max-w-7xl-Container der <main> aus */}
      <div className="mx-[calc(50%-50vw)] w-screen">
        <Marquee items={dict.plp.marqueeItems} />
      </div>

      <section aria-labelledby="shop-heading" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-ink-muted">
              {dict.plp.sectionEyebrow}
            </p>
            <h2
              id="shop-heading"
              className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
            >
              {dict.plp.sectionHeadline1}
              <br />
              {dict.plp.sectionHeadline2}
            </h2>
          </div>
          <div className="lg:text-right">
            <p className="max-w-xs text-ink-muted lg:ml-auto">{dict.plp.sectionBlurb}</p>
            <Suspense fallback={<div className="mt-1 skeleton h-4 w-24 lg:ml-auto" />}>
              <ResultSummary dict={dict} searchParams={searchParams} />
            </Suspense>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="lg:w-72 lg:shrink-0">
            {/* useSearchParams() erzwingt eine Suspense-Boundary */}
            <Suspense fallback={<div className="skeleton h-11 w-full rounded-full" />}>
              <SearchBox />
            </Suspense>
          </div>
          <div className="min-w-0 flex-1">
            <Suspense fallback={<div className="skeleton h-10 w-full rounded-full" />}>
              <Categories />
            </Suspense>
          </div>
          <div className="shrink-0">
            <Suspense fallback={<div className="skeleton h-10 w-48 rounded-full" />}>
              <SortSelect />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<ProductGridSkeleton count={PAGE_SIZE} label={dict.plp.loading} />}>
          <ProductList locale={locale} dict={dict} searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}

async function Categories() {
  const categories = await getCategories();
  return <CategoryFilter categories={categories} />;
}

async function ResultSummary({
  dict,
  searchParams,
}: { dict: Dictionary } & Pick<Props, "searchParams">) {
  const filters = parseProductFilters(await searchParams);
  const { total } = await getProducts(filters);

  return (
    <p className="text-sm text-ink-muted">
      <span className="font-semibold text-ink">
        {plural(total, dict.plp.countOne, dict.plp.countMany)}
      </span>
      {filters.category && (
        <>
          {" "}
          {t(dict.plp.inCategory, { category: categoryLabel(dict, filters.category) })}
        </>
      )}
      {filters.q && <> {t(dict.plp.forQuery, { query: filters.q })}</>}
    </p>
  );
}

async function ProductList({
  locale,
  dict,
  searchParams,
}: { locale: Locale; dict: Dictionary } & Pick<Props, "searchParams">) {
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
        <EmptyState dict={dict} hasFilters={Boolean(filters.q || filters.category)} />
      )}

      {total > 0 && (
        <div className="grid items-center gap-4 border-t border-border pt-6 sm:grid-cols-[1fr_auto_1fr]">
          <p className="text-sm text-ink-muted">{t(dict.plp.showing, { from, to, total })}</p>
          <Pagination
            locale={locale}
            dict={dict}
            filters={filters}
            total={total}
            pageSize={PAGE_SIZE}
          />
        </div>
      )}
    </div>
  );
}

function EmptyState({ dict, hasFilters }: { dict: Dictionary; hasFilters: boolean }) {
  return (
    <div className="rounded-3xl bg-surface-elevated px-6 py-20 text-center">
      <p className="text-xl font-semibold">{dict.plp.emptyTitle}</p>
      <p className="mt-2 text-ink-muted">
        {hasFilters ? dict.plp.emptyFiltered : dict.plp.emptyDefault}
      </p>
    </div>
  );
}
