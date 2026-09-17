export const LOCALES = ["de", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Default-Locale wird ohne URL-Präfix ausgeliefert (/products), andere mit (/en/products). */
export const DEFAULT_LOCALE: Locale = "de";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Hängt bei Nicht-Default-Locales das Präfix an: localePath("en", "/products") → "/en/products" */
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export const LOCALE_LABELS: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
};
