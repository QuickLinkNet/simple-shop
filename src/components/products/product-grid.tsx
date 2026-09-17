import { ProductCard, ProductCardSkeleton } from "./product-card";
import type { ProductSummary } from "@/lib/types/product";

// Bewusst nur die drei definierten Breakpoints (siehe README): 1 → 2 → 4 Spalten.
const GRID_CLASS = "grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4";

interface ProductGridProps {
  products: ProductSummary[];
  /** Anzahl Karten, deren Bild priorisiert geladen wird. */
  priorityCount?: number;
}

export function ProductGrid({ products, priorityCount = 4 }: ProductGridProps) {
  return (
    <ul className={GRID_CLASS}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({
  count = 8,
  label,
}: {
  count?: number;
  label: string;
}) {
  return (
    <div className={GRID_CLASS} role="status" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
