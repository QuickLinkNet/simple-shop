interface RatingStarsProps {
  rating: number;
  /** Anzahl Bewertungen, optional */
  count?: number;
  size?: "sm" | "md";
}

const MAX = 5;

export function RatingStars({ rating, count, size = "sm" }: RatingStarsProps) {
  const rounded = Math.round(rating * 2) / 2;
  const label = `${rating.toFixed(1)} von ${MAX} Sternen${
    count !== undefined ? `, ${count} Bewertungen` : ""
  }`;

  return (
    <div
      className={`flex items-center gap-1 ${size === "sm" ? "text-xs" : "text-sm"}`}
      role="img"
      aria-label={label}
      title={label}
    >
      <div className="flex text-amber-400" aria-hidden>
        {Array.from({ length: MAX }, (_, i) => {
          const fill = Math.min(Math.max(rounded - i, 0), 1);
          return <Star key={i} fill={fill} size={size} />;
        })}
      </div>
      <span className="font-medium text-ink">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-ink-muted">({count})</span>
      )}
    </div>
  );
}

function Star({ fill, size }: { fill: number; size: "sm" | "md" }) {
  const id = `star-${Math.round(fill * 100)}`;
  const px = size === "sm" ? 14 : 18;
  return (
    <svg width={px} height={px} viewBox="0 0 24 24">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="currentColor" />
          <stop offset={`${fill * 100}%`} stopColor="#d1d5db" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.8L12 17.6 5.9 21l1.3-6.8-5-4.7 6.8-.8z"
      />
    </svg>
  );
}
