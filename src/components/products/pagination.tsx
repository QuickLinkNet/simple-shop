import Link from "next/link";
import {
  buildProductsHref,
  type ProductFilters,
} from "@/lib/products/search-params";

interface PaginationProps {
  filters: ProductFilters;
  total: number;
  pageSize: number;
}

/** Seitenzahlen mit Ellipsen: 1 … 4 5 [6] 7 8 … 10 */
function pageRange(current: number, last: number): (number | "…")[] {
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

export function Pagination({ filters, total, pageSize }: PaginationProps) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(filters.page, last);
  if (last <= 1) return null;

  const href = (page: number) => buildProductsHref({ ...filters, page });

  const buttonClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm transition hover:border-brand-500 hover:text-brand-700";
  const disabledClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border bg-surface-muted px-3 text-sm text-ink-muted";

  return (
    <nav aria-label="Seitennavigation" className="flex items-center justify-center gap-1.5">
      {current > 1 ? (
        <Link href={href(current - 1)} className={buttonClass} rel="prev">
          <span aria-hidden>‹</span>
          <span className="sr-only">Vorherige Seite</span>
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled>
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
            className={
              item === current
                ? "inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-brand-600 px-3 text-sm font-medium text-white"
                : buttonClass
            }
          >
            {item}
          </Link>
        ),
      )}

      {current < last ? (
        <Link href={href(current + 1)} className={buttonClass} rel="next">
          <span aria-hidden>›</span>
          <span className="sr-only">Nächste Seite</span>
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled>
          ›
        </span>
      )}
    </nav>
  );
}
