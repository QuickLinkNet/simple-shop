"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";
import { categoryLabel } from "@/lib/i18n";
import {
  buildProductsHref,
  parseProductFilters,
} from "@/lib/products/search-params";
import type { CategorySlug } from "@/lib/types/product";

interface CategoryFilterProps {
  categories: CategorySlug[];
}

/**
 * Kategorie-Chips als Links: Deep-Link-fähig, prefetchbar, ohne eigenen State.
 * Der aktive Chip wird aus der URL abgeleitet; Suche und Sortierung bleiben erhalten.
 */
export function CategoryFilter({ categories }: CategoryFilterProps) {
  const { locale, dict } = useLocale();
  const searchParams = useSearchParams();
  const { category: active, q, sort } = parseProductFilters(
    Object.fromEntries(searchParams.entries()),
  );

  const chipClass = (isActive: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "border-brand-700 bg-brand-700 text-surface-elevated"
        : "border-border-strong bg-surface-elevated text-ink hover:border-brand-600 hover:text-brand-700"
    }`;

  return (
    <nav aria-label={dict.plp.categoryFilter}>
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
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
    </nav>
  );
}
