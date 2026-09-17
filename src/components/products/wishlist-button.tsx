"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { useShop } from "@/components/shop/shop-provider";
import { HeartIcon } from "@/components/ui/icons";
import { localePath } from "@/lib/i18n/config";
import type { ProductSummary } from "@/lib/types/product";

interface WishlistButtonProps {
  product: ProductSummary;
  /** "icon": runder Button auf der Card, "text": Button mit Label auf der PDP */
  variant?: "icon" | "text";
}

export function WishlistButton({ product, variant = "icon" }: WishlistButtonProps) {
  const { locale, dict } = useLocale();
  const { isInWishlist, toggleWishlist, notify } = useShop();
  const active = isInWishlist(product.id);
  const label = active ? dict.product.removeFromWishlist : dict.product.addToWishlist;

  const onClick = () => {
    toggleWishlist(product);
    notify({
      text: active ? dict.toast.removedFromWishlist : dict.toast.addedToWishlist,
      action: active
        ? undefined
        : { label: dict.toast.viewCart, href: localePath(locale, "/wishlist") },
    });
  };

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className="inline-flex items-center gap-3 self-start text-sm font-medium transition hover:text-brand-700"
      >
        <HeartIcon className={`size-6 ${active ? "text-accent" : ""}`} filled={active} />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`relative z-10 grid size-10 place-items-center rounded-full bg-surface-elevated shadow-card transition hover:scale-105 ${
        active ? "text-accent" : "text-ink"
      }`}
    >
      <HeartIcon className="size-5" filled={active} />
    </button>
  );
}
