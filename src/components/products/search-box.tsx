"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";

const DEBOUNCE_MS = 300;

/**
 * Suchfeld: schreibt `q` debounced in die URL, setzt `page` zurück.
 * Client Component, weil sie auf Eingaben reagiert und URL-State hält.
 */
export function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputId = useId();

  const urlQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);
  const lastPushed = useRef(urlQuery);

  // URL-Änderung von außen (Back-Button, Deep-Link) ins Feld übernehmen
  useEffect(() => {
    if (urlQuery !== lastPushed.current) {
      lastPushed.current = urlQuery;
      setValue(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === lastPushed.current) return;

    const timer = setTimeout(() => {
      lastPushed.current = trimmed;
      const params = new URLSearchParams(searchParams);
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      params.delete("page");

      startTransition(() => {
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, searchParams, pathname, router]);

  return (
    <div className="relative w-full sm:max-w-sm">
      <label htmlFor={inputId} className="sr-only">
        Produkte suchen
      </label>
      <svg
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Produkte suchen …"
        autoComplete="off"
        className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-9 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      {isPending && (
        <span
          role="status"
          aria-label="Suche läuft"
          className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600"
        />
      )}
    </div>
  );
}
