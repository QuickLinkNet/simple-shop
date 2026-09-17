import { Suspense } from "react";
import { SearchBox } from "@/components/products/search-box";
import { formatPrice } from "@/lib/format";
import { t, type Dictionary, type Locale } from "@/lib/i18n";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shop/store";
import { HeaderActions } from "./header-actions";
import { LocaleSwitcher } from "./locale-switcher";
import { Logo } from "./logo";

interface HeaderProps {
  locale: Locale;
  dict: Dictionary;
}

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
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:flex-nowrap sm:px-6 lg:px-8">
          <Logo locale={locale} label={dict.header.logoLabel} />
          <div className="order-3 w-full sm:order-2 sm:mx-auto sm:max-w-lg">
            {/* useSearchParams() erzwingt eine Suspense-Boundary */}
            <Suspense fallback={<div className="skeleton h-11 w-full rounded-full" />}>
              <SearchBox />
            </Suspense>
          </div>
          {/* Sprachumschalter bewusst hier, direkt oben rechts neben den
              Icons – im dünnen Promo-Balken darüber wäre er zu leicht zu
              übersehen. */}
          <div className="order-2 ml-auto flex items-center gap-2 sm:order-3 sm:ml-0">
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
