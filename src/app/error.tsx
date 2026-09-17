"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Route-Level Error Boundary: fängt z. B. API-Ausfälle von DummyJSON. */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-danger">
        Fehler
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Da ist etwas schiefgelaufen
      </h1>
      <p className="mt-2 text-ink-muted">
        Die Produktdaten konnten nicht geladen werden. Bitte versuche es erneut.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-ink-muted">Ref: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        Erneut versuchen
      </button>
    </div>
  );
}
