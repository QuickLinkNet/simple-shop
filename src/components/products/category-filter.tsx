"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";
import { ChevronIcon } from "@/components/ui/icons";
import { useHorizontalScroll } from "@/lib/hooks/use-horizontal-scroll";
import { categoryLabel } from "@/lib/i18n";
import {
  buildProductsHref,
  parseProductFilters,
} from "@/lib/products/search-params";
import type { CategorySlug } from "@/lib/types/product";

interface CategoryFilterProps {
  categories: CategorySlug[];
}

const SCROLL_STEP = 240;

/**
 * Kategorie-Chips als Links: Deep-Link-fähig, prefetchbar, ohne eigenen State.
 * Immer einzeilig und horizontal scrollbar (wie bei den meisten großen Shops),
 * statt bei vielen Kategorien mehrzeilig umzubrechen. Pfeile (ab sm) + Fade-Kanten
 * zeigen an, dass mehr Kategorien folgen; auf Touch-Geräten reicht Wischen.
 */
export function CategoryFilter({ categories }: CategoryFilterProps) {
  const { locale, dict } = useLocale();
  const searchParams = useSearchParams();
  const { category: active, q, sort } = parseProductFilters(
    Object.fromEntries(searchParams.entries()),
  );
  const { ref, canScrollPrev, canScrollNext, onScroll, scrollByAmount } =
    useHorizontalScroll<HTMLUListElement>();

  const chipClass = (isActive: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "border-brand-700 bg-brand-700 text-surface-elevated"
        : "border-border-strong bg-surface-elevated text-ink hover:border-brand-600 hover:text-brand-700"
    }`;

  const arrowClass =
    "grid size-9 shrink-0 place-items-center rounded-full border border-border-strong bg-surface-elevated transition hover:border-brand-700 hover:text-brand-700 disabled:cursor-default disabled:opacity-30 disabled:hover:border-border-strong disabled:hover:text-ink";

  return (
    <nav aria-label={dict.plp.categoryFilter} className="flex min-w-0 items-center gap-2">
      <button
        type="button"
        onClick={() => scrollByAmount(-SCROLL_STEP)}
        disabled={!canScrollPrev}
        aria-label={dict.plp.scrollPrev}
        className={`hidden sm:grid ${arrowClass}`}
      >
        <ChevronIcon direction="left" className="size-4" />
      </button>

      <div className="relative min-w-0 flex-1">
        {canScrollPrev && (
          <div
            aria-hidden
            className="pointer-events-none absolute -left-1 top-0 z-10 h-full w-8 bg-gradient-to-r from-surface to-transparent"
          />
        )}
        {canScrollNext && (
          <div
            aria-hidden
            className="pointer-events-none absolute -right-1 top-0 z-10 h-full w-8 bg-gradient-to-l from-surface to-transparent"
          />
        )}

        <ul
          ref={ref}
          onScroll={onScroll}
          className="-mx-4 flex gap-2 overflow-x-auto scroll-smooth px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <li>
            <Link
              href={buildProductsHref(locale, { q, sort })}
              className={chipClass(!active)}
              aria-current={!active ? "page" : undefined}
            >
              {dict.plp.allProducts}
            </Link>
          </li>
          {categories.map((category) => {
            const isActive = active === category;
            return (
              <li key={category}>
                <Link
                  href={buildProductsHref(locale, { q, sort, category })}
                  className={chipClass(isActive)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {categoryLabel(dict, category)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => scrollByAmount(SCROLL_STEP)}
        disabled={!canScrollNext}
        aria-label={dict.plp.scrollNext}
        className={`hidden sm:grid ${arrowClass}`}
      >
        <ChevronIcon direction="right" className="size-4" />
      </button>
    </nav>
  );
}
