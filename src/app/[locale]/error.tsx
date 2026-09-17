"use client";

import { useEffect } from "react";
import { useLocale } from "@/components/i18n/locale-provider";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Route-Level Error Boundary: fängt z. B. API-Ausfälle von DummyJSON. */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const { dict } = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-danger">
        {dict.error.kicker}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{dict.error.title}</h1>
      <p className="mt-2 text-ink-muted">{dict.error.text}</p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-ink-muted">Ref: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-11 items-center rounded-full bg-brand-700 px-6 text-sm font-semibold text-surface-elevated transition hover:bg-brand-800"
      >
        {dict.error.retry}
      </button>
    </div>
  );
}
