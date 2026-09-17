"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";
import { LOCALES, LOCALE_LABELS, isLocale } from "@/lib/i18n/config";

/**
 * DE | EN als Segmented-Control – behält Pfad und Query bei. Links sind immer
 * explizit präfixiert (/de/… bzw. /en/…); der Proxy setzt das Cookie und
 * normalisiert /de/… auf /…. Bewusst prominent in der Hauptzeile des Headers
 * platziert (nicht nur im dünnen Promo-Balken), damit er nicht übersehen wird.
 */
export function LocaleSwitcher() {
  const { locale, dict } = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Präfix des aktuellen Locales entfernen → sprachneutraler Pfad
  const segments = pathname.split("/");
  const neutralPath =
    isLocale(segments[1] ?? "") ? `/${segments.slice(2).join("/")}` : pathname;
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";

  return (
    <nav
      aria-label={dict.header.language}
      className="flex items-center gap-0.5 rounded-full border border-border-strong bg-surface-elevated p-0.5 text-xs font-semibold"
    >
      {LOCALES.map((target) => {
        const isActive = target === locale;
        const href = `/${target}${neutralPath === "/" ? "" : neutralPath}${suffix}`;
        return (
          <Link
            key={target}
            href={href}
            hrefLang={target}
            lang={target}
            aria-current={isActive ? "true" : undefined}
            aria-label={LOCALE_LABELS[target]}
            title={LOCALE_LABELS[target]}
            className={`rounded-full px-2.5 py-1.5 uppercase transition ${
              isActive
                ? "bg-brand-700 text-surface-elevated"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {target}
          </Link>
        );
      })}
    </nav>
  );
}
