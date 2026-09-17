import { Suspense } from "react";
import { SearchBox } from "@/components/products/search-box";
import type { Dictionary, Locale } from "@/lib/i18n";
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
        <div className="mx-auto grid h-7 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 text-xs font-medium sm:px-6 lg:px-8">
          <span />
          <p>{dict.header.announcement}</p>
          <div className="flex items-center justify-end gap-4">
            <p className="hidden sm:block">{dict.header.freeShipping}</p>
            {/* useSearchParams() erzwingt eine Suspense-Boundary */}
            <Suspense fallback={<span className="w-16" />}>
              <LocaleSwitcher />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:flex-nowrap sm:px-6 lg:px-8">
          <Logo locale={locale} label={dict.header.logoLabel} />
          <div className="order-3 w-full sm:order-2 sm:mx-auto sm:max-w-lg">
            <Suspense fallback={<div className="skeleton h-11 w-full rounded-full" />}>
              <SearchBox />
            </Suspense>
          </div>
          <div className="order-2 ml-auto sm:order-3 sm:ml-0">
            <HeaderActions />
          </div>
        </div>
      </div>
    </header>
  );
}
