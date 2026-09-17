import type { Locale } from "@/lib/i18n/config";

/**
 * DummyJSON liefert alle Preise in USD. Für die deutsche Locale wird in EUR
 * umgerechnet und angezeigt (Kurs siehe DECISIONS.md, Abschnitt "Preise").
 * Fest hinterlegt statt live abgefragt, weil es hier keine echte Zahlungs-
 * abwicklung gibt – für eine Produktivanbindung würde man diesen Wert durch
 * einen tagesaktuellen Kurs (z. B. von der EZB) ersetzen.
 */
const USD_TO_EUR_RATE = 0.92;

const PRICE_FORMATTERS: Record<Locale, Intl.NumberFormat> = {
  de: new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }),
  en: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
};

/** Preis (USD, wie von der API geliefert) lokalisiert formatieren – für "de" inkl. EUR-Umrechnung. */
export function formatPrice(usdValue: number, locale: Locale = "de"): string {
  const value = locale === "de" ? usdValue * USD_TO_EUR_RATE : usdValue;
  return PRICE_FORMATTERS[locale].format(value);
}

export function formatNumber(value: number, locale: Locale = "de"): string {
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

/** Preis vor Rabatt, auf 2 Nachkommastellen gerundet. */
export function originalPrice(
  price: number,
  discountPercentage: number,
): number {
  if (discountPercentage <= 0) return price;
  return Math.round((price / (1 - discountPercentage / 100)) * 100) / 100;
}

/** "mens-shirts" wird zu "Mens Shirts" – Fallback, wenn keine Übersetzung existiert. */
export function formatCategoryFallback(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function truncate(text: string, max = 160): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function formatDate(iso: string, locale: Locale = "de"): string {
  return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(iso));
}
