import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-ink-muted">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Produkt nicht gefunden
      </h1>
      <p className="mt-2 text-ink-muted">
        Das Produkt existiert nicht oder wurde entfernt.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-brand-700 px-6 text-sm font-semibold text-surface-elevated transition hover:bg-brand-800"
      >
        Zurück zur Übersicht
      </Link>
    </div>
  );
}
