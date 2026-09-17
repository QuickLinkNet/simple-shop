import Link from "next/link";
import { getRelatedProducts } from "@/lib/api/dummyjson";
import type { Dictionary, Locale } from "@/lib/i18n";
import { categoryLabel, t } from "@/lib/i18n";
import { buildProductsHref } from "@/lib/products/search-params";
import { ProductCardSkeleton } from "./product-card";
import { ProductSlider } from "./product-slider";

interface RelatedProductsProps {
  locale: Locale;
  dict: Dictionary;
  category: string;
  excludeId: number;
}

/** Async Server Component – wird in der PDP per <Suspense> gestreamt. */
export async function RelatedProducts({ locale, dict, category, excludeId }: RelatedProductsProps) {
  const products = await getRelatedProducts(category, excludeId);
  if (products.length === 0) return null;

  const label = categoryLabel(dict, category);

  return (
    <ProductSlider
      products={products}
      headingId="related-heading"
      heading={dict.product.related}
      aside={
        <Link
          href={buildProductsHref(locale, { category })}
          className="group inline-flex items-center gap-2 text-sm font-medium"
        >
          {t(dict.product.allInCategory, { category: label })}
          <span aria-hidden className="transition group-hover:translate-x-1">
            ⟶
          </span>
        </Link>
      }
    />
  );
}

export function RelatedProductsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="flex items-end justify-between">
        <div className="skeleton h-9 w-64" />
        <div className="skeleton h-4 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
