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
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span
        className={
          size === "lg"
            ? "text-3xl font-semibold tracking-tight"
            : "text-base font-semibold"
        }
      >
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <>
          <span
            className={`text-ink-muted line-through ${size === "lg" ? "text-base" : "text-xs"}`}
          >
            {formatPrice(original)}
          </span>
          <span className="sr-only">
            , {Math.round(discountPercentage)} % Rabatt
          </span>
        </>
      )}
    </div>
  );
}

export function DiscountBadge({ percentage }: { percentage: number }) {
  if (percentage < 1) return null;
  return (
    <span
      aria-hidden
      className="rounded-md bg-danger px-1.5 py-0.5 text-xs font-semibold text-white"
    >
      -{Math.round(percentage)}%
    </span>
  );
}
