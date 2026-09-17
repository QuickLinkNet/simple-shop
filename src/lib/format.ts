import type { Locale } from "@/lib/i18n/config";

const PRICE_FORMATTERS: Record<Locale, Intl.NumberFormat> = {
  de: new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD" }),
  en: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
};

/** DummyJSON liefert USD-Preise; nur die Darstellung ist lokalisiert. */
export function formatPrice(value: number, locale: Locale = "de"): string {
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
