"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { useShop } from "@/components/shop/shop-provider";
import { localePath } from "@/lib/i18n/config";
import { t } from "@/lib/i18n";
import type { ProductSummary } from "@/lib/types/product";

/** Runder "+"-Button auf der Karte – legt direkt in den Warenkorb, ohne die PDP zu öffnen. */
export function QuickAddButton({ product }: { product: ProductSummary }) {
  const { locale, dict } = useLocale();
  const { addToCart, notify } = useShop();

  const onClick = (event: React.MouseEvent) => {
    // Karte hat einen deckenden Link (Titel) für die PDP – hier verhindern,
    // dass der Klick zusätzlich navigiert.
    event.preventDefault();
    event.stopPropagation();
    addToCart(product);
    notify({
      text: dict.toast.addedToCart,
      action: { label: dict.toast.viewCart, href: localePath(locale, "/cart") },
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t(dict.product.quickAdd, { title: product.title })}
      className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full border border-ink text-ink transition hover:bg-brand-700 hover:text-surface-elevated hover:border-brand-700"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    </button>
  );
}
