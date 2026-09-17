import Link from "next/link";
import { Suspense } from "react";
import { categoryLabel, t, type Dictionary, type Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { buildProductsHref } from "@/lib/products/search-params";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shop/store";
import { HeaderActions } from "./header-actions";
import { LocaleSwitcher } from "./locale-switcher";
import { Logo } from "./logo";

interface HeaderProps {
  locale: Locale;
  dict: Dictionary;
}

// Kuratierte Kurz-Navigation aus echten Kategorie-Slugs (kein erfundenes
// "Wohnen"/"Technik"-Meta-Feld, das es in den Produktdaten nicht gibt).
const NAV_CATEGORIES = ["beauty", "furniture", "laptops"] as const;

export function Header({ locale, dict }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20">
      <div className="bg-brand-700 text-surface-elevated">
        <div className="mx-auto flex h-7 w-full max-w-7xl items-center justify-center px-4 text-xs font-medium sm:px-6 lg:px-8">
          <p>{dict.header.announcement}</p>
          <p className="ml-4 hidden sm:block">
            —{" "}
            {t(dict.header.freeShipping, {
              threshold: formatPrice(FREE_SHIPPING_THRESHOLD, locale),
            })}
          </p>
        </div>
      </div>

      <div className="border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Logo locale={locale} label={dict.header.logoLabel} />

          <nav aria-label={dict.header.navDiscover} className="ml-6 hidden items-center gap-6 text-sm font-medium lg:flex">
            <Link href={localePath(locale, "/products")} className="transition hover:text-brand-700">
              {dict.header.navDiscover}
            </Link>
            {NAV_CATEGORIES.map((slug) => (
              <Link
                key={slug}
                href={buildProductsHref(locale, { category: slug })}
                className="transition hover:text-brand-700"
              >
                {categoryLabel(dict, slug)}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Suspense fallback={<div className="skeleton h-9 w-[4.5rem] rounded-full" />}>
              <LocaleSwitcher />
            </Suspense>
            <HeaderActions />
          </div>
        </div>
      </div>
    </header>
  );
}
