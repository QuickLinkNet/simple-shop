import { formatPrice, originalPrice } from "@/lib/format";

interface PriceProps {
  price: number;
  discountPercentage: number;
  size?: "sm" | "lg";
}

/** Zeigt Preis, bei Rabatt zusätzlich den durchgestrichenen Originalpreis. */
export function Price({ price, discountPercentage, size = "sm" }: PriceProps) {
  const hasDiscount = discountPercentage >= 1;
  const original = originalPrice(price, discountPercentage);

  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span
        className={
          size === "lg"
            ? "text-4xl font-bold tracking-tight"
            : "text-lg font-bold tracking-tight"
        }
      >
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <>
          <span
            className={`text-ink-muted line-through ${size === "lg" ? "text-lg" : "text-sm"}`}
          >
            {formatPrice(original)}
          </span>
          <span className="sr-only">
            , {Math.round(discountPercentage)} % Rabatt
          </span>
        </>
      )}
    </span>
  );
}

export function DiscountBadge({
  percentage,
  size = "sm",
}: {
  percentage: number;
  size?: "sm" | "lg";
}) {
  if (percentage < 1) return null;
  return (
    <span
      aria-hidden
      className={`inline-flex items-center rounded-full bg-accent font-semibold text-surface-elevated ${
        size === "lg" ? "px-3.5 py-1.5 text-base" : "px-2.5 py-1 text-xs"
      }`}
    >
      -{Math.round(percentage)}%
    </span>
  );
}
