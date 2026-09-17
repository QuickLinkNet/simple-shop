"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { buildProductsHref } from "@/lib/products/search-params";
import { formatCategory } from "@/lib/format";
import type { CategorySlug } from "@/lib/types/product";

interface CategoryFilterProps {
  categories: CategorySlug[];
}

/**
 * Kategorie-Chips als Links: Deep-Link-fähig, prefetchbar, ohne eigenen State.
 * Der aktive Chip wird aus der URL abgeleitet.
 */
export function CategoryFilter({ categories }: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "";
  const q = searchParams.get("q") ?? undefined;

  const chipClass = (isActive: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "border-brand-700 bg-brand-700 text-surface-elevated"
        : "border-border-strong bg-surface-elevated text-ink hover:border-brand-600 hover:text-brand-700"
    }`;

  return (
    <nav aria-label="Kategorie-Filter">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        <li>
          <Link
            href={buildProductsHref({ q })}
            className={chipClass(active === "")}
            aria-current={active === "" ? "page" : undefined}
          >
            Alle Produkte
          </Link>
        </li>
        {categories.map((category) => {
          const isActive = active === category;
          return (
            <li key={category}>
              <Link
                href={buildProductsHref({ q, category })}
                className={chipClass(isActive)}
                aria-current={isActive ? "page" : undefined}
              >
                {formatCategory(category)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
