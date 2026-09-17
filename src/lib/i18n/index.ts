import { de, type Dictionary } from "./dictionaries/de";
import { en } from "./dictionaries/en";
import type { Locale } from "./config";
import { formatCategoryFallback } from "@/lib/format";

export type { Dictionary, Locale };
export * from "./config";

const DICTIONARIES: Record<Locale, Dictionary> = { de, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** Ersetzt {platzhalter} in einem Übersetzungsstring. */
export function t(
  template: string,
  params: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in params ? String(params[key]) : `{${key}}`,
  );
}

/** Kategorie-Slug → lokalisierter Name, Fallback: Slug hübsch formatiert. */
export function categoryLabel(dict: Dictionary, slug: string): string {
  return dict.categories[slug] ?? formatCategoryFallback(slug);
}

export function plural(
  count: number,
  one: string,
  many: string,
): string {
  return t(count === 1 ? one : many, { count });
}
