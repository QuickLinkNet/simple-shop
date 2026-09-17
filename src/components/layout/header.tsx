import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white"
          >
            S
          </span>
          Simple Shop
        </Link>

        <nav aria-label="Hauptnavigation" className="flex items-center gap-6 text-sm">
          <Link
            href="/products"
            className="text-ink-muted transition hover:text-ink"
          >
            Produkte
          </Link>
        </nav>
      </div>
    </header>
  );
}
