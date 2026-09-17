import Image from "next/image";
import Link from "next/link";
import { DiscountBadge, Price } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { formatCategory } from "@/lib/format";
import type { ProductSummary } from "@/lib/types/product";

interface ProductCardProps {
  product: ProductSummary;
  /** Erste sichtbare Bilder priorisieren (LCP). */
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-square bg-surface-muted">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="object-contain p-4 transition group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <DiscountBadge percentage={product.discountPercentage} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs uppercase tracking-wide text-ink-muted">
          {formatCategory(product.category)}
        </p>
        <h2 className="line-clamp-2 text-sm font-medium leading-snug">
          <Link
            href={`/products/${product.id}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {product.title}
          </Link>
        </h2>
        <RatingStars rating={product.rating} />
        <div className="mt-auto pt-2">
          <Price
            price={product.price}
            discountPercentage={product.discountPercentage}
          />
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface"
      aria-hidden
    >
      <div className="skeleton aspect-square rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton mt-2 h-5 w-1/3" />
      </div>
    </div>
  );
}
