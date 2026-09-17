"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { useShop } from "@/components/shop/shop-provider";
import { CartIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/config";
import { MAX_QUANTITY } from "@/lib/shop/store";
import type { ProductSummary } from "@/lib/types/product";
import { WishlistButton } from "./wishlist-button";

interface AddToCartProps {
  product: ProductSummary;
  stock: number;
}

/** Mengen-Stepper + Warenkorb-Button (PDP) inkl. Sticky-Bar auf Mobile. */
export function AddToCart({ product, stock }: AddToCartProps) {
  const { locale, dict } = useLocale();
  const { addToCart, cartItem, hydrated, notify } = useShop();
  const [quantity, setQuantity] = useState(1);

  const soldOut = stock <= 0;
  const max = Math.min(MAX_QUANTITY, Math.max(1, stock));
  const inCart = hydrated ? (cartItem(product.id)?.quantity ?? 0) : 0;

  const add = () => {
    addToCart(product, quantity);
    notify({
      text: dict.toast.addedToCart,
      action: { label: dict.toast.viewCart, href: localePath(locale, "/cart") },
    });
  };

  const button = (
    <button
      type="button"
      onClick={add}
      disabled={soldOut}
      className="inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-brand-700 px-6 text-base font-semibold text-surface-elevated transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-border-strong"
    >
      <CartIcon className="size-6" />
      {soldOut ? dict.product.outOfStock : dict.product.addToCart}
    </button>
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-stretch gap-3">
          <div
            role="group"
            aria-label={dict.product.quantity}
            className="flex h-14 items-center rounded-2xl border border-border-strong bg-surface-elevated"
          >
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={soldOut || quantity <= 1}
              aria-label={dict.product.decrease}
              className="h-full px-4 text-xl transition hover:text-brand-700 disabled:text-border-strong"
            >
              −
            </button>
            <output aria-live="polite" className="min-w-8 text-center text-base font-semibold">
              {quantity}
            </output>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(max, q + 1))}
              disabled={soldOut || quantity >= max}
              aria-label={dict.product.increase}
              className="h-full px-4 text-xl transition hover:text-brand-700 disabled:text-border-strong"
            >
              +
            </button>
          </div>
          {button}
        </div>

        {inCart > 0 && (
          <p className="text-sm text-ink-muted">{t(dict.product.inCart, { count: inCart })}</p>
        )}

        <WishlistButton product={product} variant="text" />
      </div>

      {/* Sticky-Bar auf Mobile (Screendesign) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <span className="text-2xl font-bold tracking-tight">{formatPrice(product.price, locale)}</span>
          {button}
        </div>
      </div>
      <div aria-hidden className="h-20 lg:hidden" />
    </>
  );
}
