import { describe, expect, it } from "vitest";
import type { ProductSummary } from "@/lib/types/product";
import {
  EMPTY_STATE,
  MAX_QUANTITY,
  cartCount,
  cartSubtotal,
  parseStoredState,
  shippingCost,
  shopReducer,
  type ShopState,
} from "./store";

const product = (id: number, price = 10): ProductSummary => ({
  id,
  title: `Produkt ${id}`,
  category: "beauty",
  price,
  discountPercentage: 0,
  rating: 4,
  thumbnail: "https://cdn.dummyjson.com/x.webp",
});

describe("shopReducer – cart", () => {
  it("fügt Produkte hinzu und summiert Mengen", () => {
    let state = shopReducer(EMPTY_STATE, { type: "cart/add", product: product(1), quantity: 2 });
    state = shopReducer(state, { type: "cart/add", product: product(1), quantity: 3 });
    expect(state.cart).toEqual([{ product: product(1), quantity: 5 }]);
  });

  it("begrenzt die Menge auf MAX_QUANTITY", () => {
    const state = shopReducer(EMPTY_STATE, {
      type: "cart/add",
      product: product(1),
      quantity: MAX_QUANTITY + 50,
    });
    expect(state.cart[0]?.quantity).toBe(MAX_QUANTITY);
  });

  it("entfernt bei Menge < 1", () => {
    let state = shopReducer(EMPTY_STATE, { type: "cart/add", product: product(1), quantity: 1 });
    state = shopReducer(state, { type: "cart/setQuantity", id: 1, quantity: 0 });
    expect(state.cart).toEqual([]);
  });

  it("leert den Warenkorb, lässt die Wunschliste unangetastet", () => {
    let state = shopReducer(EMPTY_STATE, { type: "cart/add", product: product(1), quantity: 1 });
    state = shopReducer(state, { type: "wishlist/toggle", product: product(2) });
    state = shopReducer(state, { type: "cart/clear" });
    expect(state.cart).toEqual([]);
    expect(state.wishlist).toHaveLength(1);
  });
});

describe("shopReducer – cart/updateProduct (Revalidation)", () => {
  it("überschreibt nur die angegebenen Felder der Produkt-Momentaufnahme", () => {
    let state = shopReducer(EMPTY_STATE, { type: "cart/add", product: product(1, 10), quantity: 2 });
    state = shopReducer(state, {
      type: "cart/updateProduct",
      id: 1,
      patch: { price: 12.5, discountPercentage: 5 },
    });
    expect(state.cart[0]?.product.price).toBe(12.5);
    expect(state.cart[0]?.product.discountPercentage).toBe(5);
    expect(state.cart[0]?.product.title).toBe("Produkt 1");
    expect(state.cart[0]?.quantity).toBe(2);
  });

  it("ignoriert unbekannte IDs", () => {
    const state = shopReducer(EMPTY_STATE, {
      type: "cart/updateProduct",
      id: 999,
      patch: { price: 1 },
    });
    expect(state).toEqual(EMPTY_STATE);
  });
});

describe("shopReducer – wishlist", () => {
  it("toggelt Einträge", () => {
    let state = shopReducer(EMPTY_STATE, { type: "wishlist/toggle", product: product(1) });
    expect(state.wishlist).toHaveLength(1);
    state = shopReducer(state, { type: "wishlist/toggle", product: product(1) });
    expect(state.wishlist).toHaveLength(0);
  });
});

describe("Berechnungen", () => {
  const cart: ShopState["cart"] = [
    { product: product(1, 20), quantity: 2 },
    { product: product(2, 5.5), quantity: 1 },
  ];

  it("zählt und summiert", () => {
    expect(cartCount(cart)).toBe(3);
    expect(cartSubtotal(cart)).toBeCloseTo(45.5);
  });

  it("berechnet Versandkosten mit Freigrenze", () => {
    expect(shippingCost(0)).toBe(0);
    expect(shippingCost(30)).toBeGreaterThan(0);
    expect(shippingCost(75)).toBe(0);
  });
});

describe("parseStoredState", () => {
  it("liefert den leeren State bei null/ungültigem JSON", () => {
    expect(parseStoredState(null)).toEqual(EMPTY_STATE);
    expect(parseStoredState("{not json")).toEqual(EMPTY_STATE);
    expect(parseStoredState('"string"')).toEqual(EMPTY_STATE);
  });

  it("filtert kaputte Einträge heraus", () => {
    const raw = JSON.stringify({
      cart: [{ product: product(1), quantity: 2 }, { product: { id: "x" }, quantity: 1 }, null],
      wishlist: [product(3), { title: "ohne id" }],
    });
    expect(parseStoredState(raw)).toEqual({
      cart: [{ product: product(1), quantity: 2 }],
      wishlist: [product(3)],
    });
  });
});
