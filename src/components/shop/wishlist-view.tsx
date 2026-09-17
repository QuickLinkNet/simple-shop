"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { ProductCard } from "@/components/products/product-card";
import { CartIcon } from "@/components/ui/icons";
import { plural } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/config";
import { EmptyState } from "./cart-view";
import { useShop } from "./shop-provider";

export function WishlistView() {
  const { locale, dict } = useLocale();
  const { wishlist, hydrated, addToCart, notify } = useShop();

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-8" aria-busy>
        <div className="skeleton h-10 w-56" />
        <div className="skeleton h-72 rounded-3xl" />
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <EmptyState
        title={dict.wishlist.title}
        text={dict.wishlist.empty}
        cta={dict.wishlist.emptyCta}
        href={localePath(locale, "/products")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{dict.wishlist.title}</h1>
        <p className="text-sm text-ink-muted">
          {plural(wishlist.length, dict.wishlist.itemsOne, dict.wishlist.itemsMany)}
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {wishlist.map((product) => (
          <li key={product.id} className="flex flex-col gap-3">
            <ProductCard product={product} />
            <button
              type="button"
              onClick={() => {
                addToCart(product);
                notify({
                  text: dict.toast.addedToCart,
                  action: { label: dict.toast.viewCart, href: localePath(locale, "/cart") },
                });
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-brand-700 text-sm font-semibold text-brand-700 transition hover:bg-brand-700 hover:text-surface-elevated"
            >
              <CartIcon className="size-5" />
              {dict.product.addToCart}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
