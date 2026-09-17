import { RatingStars } from "@/components/ui/rating-stars";
import { formatDate } from "@/lib/format";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { ProductReview } from "@/lib/types/product";

interface ProductReviewsProps {
  locale: Locale;
  dict: Dictionary;
  reviews: ProductReview[];
}

/** Bewertungen aus der API (kommen direkt mit dem Produkt), Sprungziel für die Sterne oben. */
export function ProductReviews({ locale, dict, reviews }: ProductReviewsProps) {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="scroll-mt-24 border-t border-border pt-10"
    >
      <h2 id="reviews-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
        {dict.product.reviewsHeading}
        {reviews.length > 0 && (
          <span className="ml-3 align-middle text-lg font-medium text-ink-muted">
            ({reviews.length})
          </span>
        )}
      </h2>

      {reviews.length === 0 ? (
        <p className="mt-4 text-ink-muted">{dict.product.noReviews}</p>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2">
          {reviews.map((review, index) => (
            <li
              key={`${review.reviewerEmail}-${index}`}
              className="flex flex-col gap-3 rounded-2xl bg-surface-elevated p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <RatingStars rating={review.rating} />
                <time dateTime={review.date} className="shrink-0 text-xs text-ink-muted">
                  {formatDate(review.date, locale)}
                </time>
              </div>
              <p className="font-semibold">{review.reviewerName}</p>
              <p className="leading-relaxed text-ink-muted">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
