import { describe, expect, it } from "vitest";
import {
  buildProductsHref,
  parseProductFilters,
  sortToApi,
} from "./search-params";

describe("parseProductFilters", () => {
  it("liefert Defaults bei leeren Params", () => {
    expect(parseProductFilters({})).toEqual({
      page: 1,
      category: undefined,
      q: undefined,
      sort: "recommended",
    });
  });

  it("parst gültige Werte", () => {
    expect(
      parseProductFilters({ page: "3", category: "laptops", q: " phone ", sort: "price-asc" }),
    ).toEqual({ page: 3, category: "laptops", q: "phone", sort: "price-asc" });
  });

  it("fällt bei ungültiger Seite auf 1 zurück", () => {
    expect(parseProductFilters({ page: "0" }).page).toBe(1);
    expect(parseProductFilters({ page: "-2" }).page).toBe(1);
    expect(parseProductFilters({ page: "abc" }).page).toBe(1);
  });

  it("ignoriert unbekannte Sortierungen", () => {
    expect(parseProductFilters({ sort: "hack" }).sort).toBe("recommended");
  });

  it("nimmt bei Arrays den ersten Wert und kürzt lange Queries", () => {
    expect(parseProductFilters({ q: ["a", "b"] }).q).toBe("a");
    expect(parseProductFilters({ q: "x".repeat(200) }).q).toHaveLength(100);
  });

  it("behandelt leere Strings als nicht gesetzt", () => {
    expect(parseProductFilters({ q: "   ", category: "" })).toMatchObject({
      q: undefined,
      category: undefined,
    });
  });
});

describe("buildProductsHref", () => {
  it("serialisiert keine Defaults", () => {
    expect(buildProductsHref("de", { page: 1, sort: "recommended" })).toBe("/products");
  });

  it("serialisiert alle gesetzten Filter", () => {
    expect(
      buildProductsHref("de", { q: "phone", category: "smartphones", sort: "price-desc", page: 2 }),
    ).toBe("/products?q=phone&category=smartphones&sort=price-desc&page=2");
  });

  it("präfixiert Nicht-Default-Locales", () => {
    expect(buildProductsHref("en", { category: "laptops" })).toBe("/en/products?category=laptops");
  });

  it("ist invers zu parseProductFilters", () => {
    const filters = { q: "ck", category: "fragrances", sort: "rating-desc" as const, page: 4 };
    const href = buildProductsHref("de", filters);
    const params = Object.fromEntries(new URL(href, "http://x").searchParams.entries());
    expect(parseProductFilters(params)).toEqual(filters);
  });
});

describe("sortToApi", () => {
  it("mappt auf DummyJSON-Parameter", () => {
    expect(sortToApi("price-asc")).toEqual({ sortBy: "price", order: "asc" });
    expect(sortToApi("rating-desc")).toEqual({ sortBy: "rating", order: "desc" });
    expect(sortToApi("recommended")).toBeUndefined();
  });
});
