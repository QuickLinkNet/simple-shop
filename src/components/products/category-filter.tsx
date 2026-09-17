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
const FADE = "2.5rem";

/**
 * Kategorie-Chips als Links: Deep-Link-fähig, prefetchbar, ohne eigenen State.
 * Immer einzeilig und horizontal scrollbar (wie bei den meisten großen Shops),
 * statt bei vielen Kategorien mehrzeilig umzubrechen. Pfeile (ab Tablet) und
 * eine echte CSS-Maske zeigen an, dass mehr Kategorien folgen.
 *
 * Bewusst eine `mask-image` statt eines farbigen Verlaufs-Overlays: Pillen-
 * und Seitenhintergrund liegen fast im selben sehr hellen Ton, ein Overlay,
 * das zur Hintergrundfarbe hin ausblendet, wäre darauf praktisch unsichtbar
 * gewesen und die letzte Pille wirkte hart abgeschnitten statt weich
 * ausgeblendet. Eine Maske macht das Element selbst transparent – das
 * funktioniert unabhängig von jeder Hintergrundfarbe.
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

  const maskStops = [
    canScrollPrev ? "transparent 0" : "black 0",
    ...(canScrollPrev ? [`black ${FADE}`] : []),
    ...(canScrollNext ? [`black calc(100% - ${FADE})`] : []),
    canScrollNext ? "transparent 100%" : "black 100%",
  ].join(", ");
  const maskImage = `linear-gradient(to right, ${maskStops})`;

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

      <ul
        ref={ref}
        onScroll={onScroll}
        style={{ maskImage, WebkitMaskImage: maskImage }}
        className="-mx-4 flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
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
