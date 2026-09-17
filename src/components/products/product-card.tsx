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
    <article className="group relative flex flex-col gap-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface-muted">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="object-contain p-6 transition duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <DiscountBadge percentage={product.discountPercentage} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            {formatCategory(product.category)}
          </p>
          <RatingStars rating={product.rating} />
        </div>
        <h2 className="line-clamp-2 text-base font-semibold leading-snug">
          <Link
            href={`/products/${product.id}`}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-600"
          >
            {product.title}
          </Link>
        </h2>
        <Price price={product.price} discountPercentage={product.discountPercentage} />
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <div className="skeleton aspect-[4/5] rounded-2xl" />
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <div className="skeleton h-3 w-1/3" />
          <div className="skeleton h-3 w-14" />
        </div>
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-5 w-1/3" />
      </div>
    </div>
  );
}
