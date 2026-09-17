"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";
import { LOCALES, LOCALE_LABELS, isLocale } from "@/lib/i18n/config";

/**
 * DE | EN – behält Pfad und Query bei. Links sind immer explizit präfixiert
 * (/de/… bzw. /en/…); der Proxy setzt das Cookie und normalisiert /de/… auf /….
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
    <nav aria-label={dict.header.language} className="flex items-center gap-1">
      {LOCALES.map((target, index) => {
        const isActive = target === locale;
        const href = `/${target}${neutralPath === "/" ? "" : neutralPath}${suffix}`;
        return (
          <span key={target} className="flex items-center gap-1">
            {index > 0 && <span aria-hidden className="text-surface-elevated/40">|</span>}
            <Link
              href={href}
              hrefLang={target}
              lang={target}
              aria-current={isActive ? "true" : undefined}
              aria-label={LOCALE_LABELS[target]}
              title={LOCALE_LABELS[target]}
              className={`rounded px-1 uppercase transition ${
                isActive
                  ? "font-bold text-surface-elevated"
                  : "text-surface-elevated/70 hover:text-surface-elevated"
              }`}
            >
              {target}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
