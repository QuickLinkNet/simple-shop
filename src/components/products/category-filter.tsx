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
    `shrink-0 rounded-full border px-3 py-1.5 text-sm transition ${
      isActive
        ? "border-brand-600 bg-brand-600 text-white"
        : "border-border bg-surface text-ink hover:border-brand-500 hover:text-brand-700"
    }`;

  return (
    <nav aria-label="Kategorie-Filter">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <li>
          <Link
            href={buildProductsHref({ q })}
            className={chipClass(active === "")}
            aria-current={active === "" ? "page" : undefined}
          >
            Alle
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
