import type { ProductSummary } from "@/lib/types/product";

export interface CartItem {
  product: ProductSummary;
  quantity: number;
}

export interface ShopState {
  cart: CartItem[];
  wishlist: ProductSummary[];
}

export const EMPTY_STATE: ShopState = { cart: [], wishlist: [] };

export const STORAGE_KEY = "simple-shop:v1";
export const MAX_QUANTITY = 99;

export type ShopAction =
  | { type: "cart/add"; product: ProductSummary; quantity: number }
  | { type: "cart/setQuantity"; id: number; quantity: number }
  | { type: "cart/remove"; id: number }
  | { type: "cart/clear" }
  | { type: "wishlist/toggle"; product: ProductSummary }
  | { type: "wishlist/remove"; id: number };

function clampQuantity(value: number): number {
  return Math.min(MAX_QUANTITY, Math.max(1, Math.round(value)));
}

export function shopReducer(state: ShopState, action: ShopAction): ShopState {
  switch (action.type) {
    case "cart/add": {
      const existing = state.cart.find((i) => i.product.id === action.product.id);
      const cart = existing
        ? state.cart.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: clampQuantity(i.quantity + action.quantity) }
              : i,
          )
        : [...state.cart, { product: action.product, quantity: clampQuantity(action.quantity) }];
      return { ...state, cart };
    }

    case "cart/setQuantity":
      if (action.quantity < 1) {
        return { ...state, cart: state.cart.filter((i) => i.product.id !== action.id) };
      }
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.product.id === action.id ? { ...i, quantity: clampQuantity(action.quantity) } : i,
        ),
      };

    case "cart/remove":
      return { ...state, cart: state.cart.filter((i) => i.product.id !== action.id) };

    case "cart/clear":
      return { ...state, cart: [] };

    case "wishlist/toggle": {
      const exists = state.wishlist.some((p) => p.id === action.product.id);
      return {
        ...state,
        wishlist: exists
          ? state.wishlist.filter((p) => p.id !== action.product.id)
          : [...state.wishlist, action.product],
      };
    }

    case "wishlist/remove":
      return { ...state, wishlist: state.wishlist.filter((p) => p.id !== action.id) };
  }
}

/** Defensive Validierung beim Lesen aus localStorage (Struktur könnte sich ändern). */
export function parseStoredState(raw: string | null): ShopState {
  if (!raw) return EMPTY_STATE;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return EMPTY_STATE;
    const { cart, wishlist } = parsed as Partial<ShopState>;
    return {
      cart: Array.isArray(cart) ? cart.filter(isCartItem) : [],
      wishlist: Array.isArray(wishlist) ? wishlist.filter(isProductSummary) : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

function isProductSummary(value: unknown): value is ProductSummary {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "number" &&
    typeof p.title === "string" &&
    typeof p.price === "number" &&
    typeof p.thumbnail === "string" &&
    typeof p.category === "string"
  );
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const i = value as Record<string, unknown>;
  return typeof i.quantity === "number" && isProductSummary(i.product);
}

export const FREE_SHIPPING_THRESHOLD = 75;
export const SHIPPING_COST = 4.99;

export function cartSubtotal(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}

export function shippingCost(subtotal: number): number {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}
