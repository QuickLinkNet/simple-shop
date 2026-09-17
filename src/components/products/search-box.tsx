"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";

const DEBOUNCE_MS = 300;
const LISTING_PATH = "/products";

/**
 * Suchfeld im Header.
 * - Auf der PLP: schreibt `q` debounced in die URL (Live-Suche), setzt `page` zurück.
 * - Auf allen anderen Seiten: navigiert per Enter zur PLP mit `?q=`.
 */
export function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputId = useId();

  const isListing = pathname === LISTING_PATH;
  const urlQuery = isListing ? (searchParams.get("q") ?? "") : "";
  const [value, setValue] = useState(urlQuery);
  const lastPushed = useRef(urlQuery);

  // URL-Änderung von außen (Back-Button, Deep-Link) ins Feld übernehmen
  useEffect(() => {
    if (urlQuery !== lastPushed.current) {
      lastPushed.current = urlQuery;
      setValue(urlQuery);
    }
  }, [urlQuery]);

  // Live-Suche nur auf der PLP
  useEffect(() => {
    if (!isListing) return;
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
        router.replace(qs ? `${LISTING_PATH}?${qs}` : LISTING_PATH);
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, isListing, searchParams, router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    lastPushed.current = trimmed;
    startTransition(() => {
      router.push(
        trimmed ? `${LISTING_PATH}?q=${encodeURIComponent(trimmed)}` : LISTING_PATH,
      );
    });
  };

  return (
    <form role="search" onSubmit={handleSubmit} className="relative w-full">
      <label htmlFor={inputId} className="sr-only">
        Produkte suchen
      </label>
      <svg
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-muted"
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
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Was suchst du heute?"
        autoComplete="off"
        className="h-11 w-full rounded-full border border-border-strong bg-surface-elevated pl-11 pr-10 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
      />
      {isPending && (
        <span
          role="status"
          aria-label="Suche läuft"
          className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600"
        />
      )}
    </form>
  );
}
