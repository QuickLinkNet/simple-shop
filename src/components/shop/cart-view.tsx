"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/i18n/locale-provider";
import { TrashIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import { categoryLabel, plural } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/config";
import { MAX_QUANTITY, shippingCost } from "@/lib/shop/store";
import { useShop } from "./shop-provider";
import { useCartPriceSync } from "./use-cart-price-sync";

export function CartView() {
  const { locale, dict } = useLocale();
  const { cart, cartCount, cartSubtotal, hydrated, setQuantity, removeFromCart, clearCart, notify } =
    useShop();
  // Preis-/Bestandscheck gegen die Live-Daten, sobald der Warenkorb sichtbar ist.
  const { notices, dismiss } = useCartPriceSync();

  if (!hydrated) {
    return <CartSkeleton />;
  }

  // Wichtig: erst NACH den Hinweisen verzweigen. Wenn die Revalidation die
  // letzte Position entfernt (z. B. nicht mehr verfügbar), muss der Hinweis
  // trotzdem sichtbar bleiben – sonst sieht der Nutzer nur noch "leer" und
  // nie, warum. Siehe DECISIONS.md, Abschnitt 3.2.
  const isEmpty = cart.length === 0;
  const shipping = shippingCost(cartSubtotal);
  const total = cartSubtotal + shipping;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{dict.cart.title}</h1>
        {!isEmpty && (
          <p className="text-sm text-ink-muted">
            {plural(cartCount, dict.cart.itemsOne, dict.cart.itemsMany)}
          </p>
        )}
      </div>

      {notices.length > 0 && (
        <ul className="flex flex-col gap-2" aria-live="polite">
          {notices.map((notice) => (
            <li
              key={notice.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-warning/30 bg-cream px-4 py-3 text-sm text-ink"
            >
              <span>{notice.text}</span>
              <button
                type="button"
                onClick={() => dismiss(notice.id)}
                aria-label={dict.cart.dismissNotice}
                className="grid size-6 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {isEmpty ? (
        <div className="rounded-3xl bg-surface-elevated px-6 py-20 text-center">
          <p className="text-lg text-ink-muted">{dict.cart.empty}</p>
          <Link
            href={localePath(locale, "/products")}
            className="mt-6 inline-flex h-12 items-center rounded-full bg-brand-700 px-6 text-sm font-semibold text-surface-elevated transition hover:bg-brand-800"
          >
            {dict.cart.emptyCta}
          </Link>
        </div>
      ) : (
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <ul className="divide-y divide-border rounded-3xl bg-surface-elevated px-5 sm:px-6">
          {cart.map(({ product, quantity }) => (
            <li key={product.id} className="flex gap-4 py-5 sm:gap-6">
              <Link
                href={localePath(locale, `/products/${product.id}`)}
                className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:size-28"
              >
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  sizes="112px"
                  className="object-contain p-2"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                      {categoryLabel(dict, product.category)}
                    </p>
                    <Link
                      href={localePath(locale, `/products/${product.id}`)}
                      className="line-clamp-2 font-semibold leading-snug hover:text-brand-700"
                    >
                      {product.title}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeFromCart(product.id);
                      notify({ text: dict.toast.removedFromCart });
                    }}
                    aria-label={`${dict.cart.remove}: ${product.title}`}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-danger"
                  >
                    <TrashIcon className="size-5" />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                  <div
                    role="group"
                    aria-label={dict.product.quantity}
                    className="flex h-10 items-center rounded-full border border-border-strong"
                  >
                    <button
                      type="button"
                      onClick={() => setQuantity(product.id, quantity - 1)}
                      aria-label={dict.product.decrease}
                      className="h-full px-3 text-lg transition hover:text-brand-700"
                    >
                      −
                    </button>
                    <span className="min-w-7 text-center text-sm font-semibold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(product.id, quantity + 1)}
                      disabled={quantity >= MAX_QUANTITY}
                      aria-label={dict.product.increase}
                      className="h-full px-3 text-lg transition hover:text-brand-700 disabled:text-border-strong"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold tracking-tight">
                      {formatPrice(product.price * quantity, locale)}
                    </p>
                    {quantity > 1 && (
                      <p className="text-xs text-ink-muted">
                        {quantity} × {formatPrice(product.price, locale)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="flex flex-col gap-4 rounded-3xl bg-surface-elevated p-6 lg:sticky lg:top-32">
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">{dict.cart.subtotal}</dt>
              <dd>{formatPrice(cartSubtotal, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">{dict.cart.shipping}</dt>
              <dd className={shipping === 0 ? "text-success" : undefined}>
                {shipping === 0 ? dict.cart.free : formatPrice(shipping, locale)}
              </dd>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-ink-muted">{dict.cart.shippingNote}</p>
            )}
            <div className="mt-2 flex justify-between border-t border-border pt-3 text-lg font-bold">
              <dt>{dict.cart.total}</dt>
              <dd>{formatPrice(total, locale)}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => notify({ text: dict.cart.checkoutNote })}
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-brand-700 px-6 text-base font-semibold text-surface-elevated transition hover:bg-brand-800"
          >
            {dict.cart.checkout}
          </button>
          <p className="text-center text-xs text-ink-muted">{dict.cart.checkoutNote}</p>

          <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
            <Link
              href={localePath(locale, "/products")}
              className="font-medium underline-offset-4 hover:underline"
            >
              {dict.cart.continue}
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="self-start text-ink-muted underline-offset-4 hover:text-danger hover:underline"
            >
              {dict.cart.clear}
            </button>
          </div>
        </aside>
      </div>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  text,
  cta,
  href,
}: {
  title: string;
  text: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <div className="rounded-3xl bg-surface-elevated px-6 py-20 text-center">
        <p className="text-lg text-ink-muted">{text}</p>
        <Link
          href={href}
          className="mt-6 inline-flex h-12 items-center rounded-full bg-brand-700 px-6 text-sm font-semibold text-surface-elevated transition hover:bg-brand-800"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy>
      <div className="skeleton h-10 w-56" />
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="skeleton h-72 rounded-3xl" />
        <div className="skeleton h-64 rounded-3xl" />
      </div>
    </div>
  );
}
