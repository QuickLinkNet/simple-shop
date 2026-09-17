import { ProductCardSkeleton } from "./product-card";
import { ProductCard } from "./product-card";
import { getRelatedProducts } from "@/lib/api/dummyjson";

interface RelatedProductsProps {
  category: string;
  excludeId: number;
}

const GRID_CLASS = "grid grid-cols-2 gap-4 md:grid-cols-4";

/** Async Server Component – wird in der PDP per <Suspense> gestreamt. */
export async function RelatedProducts({
  category,
  excludeId,
}: RelatedProductsProps) {
  const products = await getRelatedProducts(category, excludeId);
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="flex flex-col gap-4">
      <h2 id="related-heading" className="text-xl font-semibold tracking-tight">
        Ähnliche Produkte
      </h2>
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
    <div className="flex flex-col gap-4" aria-hidden>
      <div className="skeleton h-7 w-48" />
      <div className={GRID_CLASS}>
        {Array.from({ length: 4 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
