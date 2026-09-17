"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useId, useTransition } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import {
  SORT_OPTIONS,
  buildProductsHref,
  parseProductFilters,
  type SortOption,
} from "@/lib/products/search-params";

/** Sortierung als natives <select>; schreibt `sort` in die URL und setzt `page` zurück. */
export function SortSelect() {
  const { locale, dict } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const id = useId();

  const filters = parseProductFilters(Object.fromEntries(searchParams.entries()));

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = event.target.value as SortOption;
    startTransition(() => {
      router.replace(buildProductsHref(locale, { ...filters, sort, page: 1 }));
    });
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm text-ink-muted">
        {dict.plp.sortLabel}
      </label>
      <select
        id={id}
        value={filters.sort}
        onChange={onChange}
        disabled={isPending}
        className="h-10 rounded-full border border-border-strong bg-surface-elevated pl-4 pr-9 text-sm font-medium text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {dict.plp.sort[option]}
          </option>
        ))}
      </select>
    </div>
  );
}
