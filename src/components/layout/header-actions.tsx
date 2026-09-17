"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/locale-provider";
import { useShop } from "@/components/shop/shop-provider";
import { CartIcon, HeartIcon } from "@/components/ui/icons";
import { localePath } from "@/lib/i18n/config";

/** Wunschliste + Warenkorb mit Badge. Zähler erscheinen erst nach Hydration aus localStorage. */
export function HeaderActions() {
  const { locale, dict } = useLocale();
  const { hydrated, cartCount, wishlist } = useShop();

  return (
    <nav aria-label={`${dict.header.wishlist} / ${dict.header.cart}`} className="flex items-center gap-1">
      <ActionLink
        href={localePath(locale, "/wishlist")}
        label={dict.header.wishlist}
        count={hydrated ? wishlist.length : 0}
      >
        <HeartIcon className="size-6" filled={hydrated && wishlist.length > 0} />
      </ActionLink>
      <ActionLink
        href={localePath(locale, "/cart")}
        label={dict.header.cart}
        count={hydrated ? cartCount : 0}
      >
        <CartIcon className="size-6" />
      </ActionLink>
    </nav>
  );
}

function ActionLink({
  href,
  label,
  count,
  children,
}: {
  href: string;
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className="relative grid size-11 place-items-center rounded-full text-brand-800 transition hover:bg-surface-muted"
    >
      {children}
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-brand-700 px-1 text-[0.65rem] font-bold leading-5 text-surface-elevated"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
