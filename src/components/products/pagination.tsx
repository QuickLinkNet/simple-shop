import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import {
  buildProductsHref,
  type ProductFilters,
} from "@/lib/products/search-params";

interface PaginationProps {
  locale: Locale;
  dict: Dictionary;
  filters: ProductFilters;
  total: number;
  pageSize: number;
}

/** Seitenzahlen mit Ellipsen: 1 … 4 5 [6] 7 8 … 10 */
export function pageRange(current: number, last: number): (number | "…")[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const pages = new Set<number>([1, last]);
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= last) pages.add(p);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i];
    const prev = sorted[i - 1];
    if (prev !== undefined && page - prev > 1) result.push("…");
    result.push(page);
  }
  return result;
}

const BUTTON =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition hover:bg-surface-muted hover:text-brand-700";
const DISABLED =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm text-border-strong";
const ACTIVE =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-brand-700 px-3 text-sm font-semibold text-surface-elevated";

export function Pagination({ locale, dict, filters, total, pageSize }: PaginationProps) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(filters.page, last);
  if (last <= 1) return null;

  const href = (page: number) => buildProductsHref(locale, { ...filters, page });

  return (
    <nav aria-label={dict.plp.pagination} className="flex items-center justify-center gap-1">
      {current > 1 ? (
        <Link href={href(current - 1)} className={BUTTON} rel="prev">
          <span aria-hidden>‹</span>
          <span className="sr-only">{dict.plp.prevPage}</span>
        </Link>
      ) : (
        <span className={DISABLED} aria-disabled>
          ‹
        </span>
      )}

      {pageRange(current, last).map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-1 text-ink-muted" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={item}
            href={href(item)}
            aria-current={item === current ? "page" : undefined}
            className={item === current ? ACTIVE : BUTTON}
          >
            {item}
          </Link>
        ),
      )}

      {current < last ? (
        <Link href={href(current + 1)} className={BUTTON} rel="next">
          <span aria-hidden>›</span>
          <span className="sr-only">{dict.plp.nextPage}</span>
        </Link>
      ) : (
        <span className={DISABLED} aria-disabled>
          ›
        </span>
      )}
    </nav>
  );
}
