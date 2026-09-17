import Link from "next/link";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { getRelatedProducts } from "@/lib/api/dummyjson";

interface RelatedProductsProps {
  category: string;
  categoryLabel: string;
  categoryHref: string;
  excludeId: number;
}

const GRID_CLASS = "grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4";

/** Async Server Component – wird in der PDP per <Suspense> gestreamt. */
export async function RelatedProducts({
  category,
  categoryLabel,
  categoryHref,
  excludeId,
}: RelatedProductsProps) {
  const products = await getRelatedProducts(category, excludeId);
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2
          id="related-heading"
          className="text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Ähnliche Produkte
        </h2>
        <Link
          href={categoryHref}
          className="group inline-flex items-center gap-2 text-sm font-medium"
        >
          Alle {categoryLabel}-Produkte
          <span aria-hidden className="transition group-hover:translate-x-1">
            ⟶
          </span>
        </Link>
      </div>
      <ul className={GRID_CLASS}>
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="flex items-end justify-between">
        <div className="skeleton h-9 w-64" />
        <div className="skeleton h-4 w-40" />
      </div>
      <div className={GRID_CLASS}>
        {Array.from({ length: 4 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
