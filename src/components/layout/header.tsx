import { Suspense } from "react";
import { SearchBox } from "@/components/products/search-box";
import { Logo } from "./logo";

export function Header() {
  return (
    <header className="sticky top-0 z-20">
      <div className="bg-brand-700 text-surface-elevated">
        <div className="mx-auto flex h-7 w-full max-w-7xl items-center justify-center px-4 text-xs font-medium sm:justify-between sm:px-6 lg:px-8">
          <p className="sm:flex-1 sm:text-center">Gute Dinge. Jeden Tag.</p>
          <p className="hidden sm:block">Kostenloser Versand ab 75 €</p>
        </div>
      </div>

      <div className="border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-8 sm:px-6 lg:px-8">
          <Logo />
          <div className="sm:mx-auto sm:w-full sm:max-w-lg">
            {/* useSearchParams() erzwingt eine Suspense-Boundary */}
            <Suspense fallback={<div className="skeleton h-11 w-full rounded-full" />}>
              <SearchBox />
            </Suspense>
          </div>
          {/* Platzhalter, damit die Suche mittig bleibt (Breite der Logo-Spalte) */}
          <div aria-hidden className="hidden w-40 sm:block" />
        </div>
      </div>
    </header>
  );
}
