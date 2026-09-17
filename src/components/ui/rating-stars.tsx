"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { formatNumber } from "@/lib/format";
import { plural, t } from "@/lib/i18n";

interface RatingStarsProps {
  rating: number;
  /** Anzahl Bewertungen, optional */
  count?: number;
  /** "compact": ein Stern + Zahl (Card), "full": fünf Sterne (PDP) */
  variant?: "compact" | "full";
}

const MAX = 5;

export function RatingStars({ rating, count, variant = "compact" }: RatingStarsProps) {
  const { locale, dict } = useLocale();
  const display = formatNumber(rating, locale);
  const reviews =
    count !== undefined ? plural(count, dict.product.reviewsOne, dict.product.reviewsMany) : "";
  const label = `${t(dict.product.ratingLabel, { rating: display })}${reviews ? `, ${reviews}` : ""}`;

  if (variant === "compact") {
    return (
      <span className="flex items-center gap-1 text-sm" role="img" aria-label={label} title={label}>
        <Star fill={1} size={15} />
        <span className="font-medium">{display}</span>
        {count !== undefined && <span className="text-ink-muted">({count})</span>}
      </span>
    );
  }

  const rounded = Math.round(rating * 2) / 2;

  return (
    <span className="flex items-center gap-2 text-sm" role="img" aria-label={label} title={label}>
      <span className="flex gap-0.5">
        {Array.from({ length: MAX }, (_, i) => (
          <Star key={i} fill={Math.min(Math.max(rounded - i, 0), 1)} size={20} />
        ))}
      </span>
      <span className="font-semibold">{display}</span>
      {reviews && <span className="text-ink-muted">· {reviews}</span>}
    </span>
  );
}

function Star({ fill, size }: { fill: number; size: number }) {
  const id = `star-fill-${Math.round(fill * 100)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="text-star">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="currentColor" />
          <stop offset={`${fill * 100}%`} stopColor="#d8d3c8" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.8L12 17.6 5.9 21l1.3-6.8-5-4.7 6.8-.8z"
      />
    </svg>
  );
}
