"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  dispatch,
  getHydrated,
  getServerHydrated,
  getServerSnapshot,
  getSnapshot,
  subscribe,
} from "@/lib/shop/external-store";
import { cartCount, cartSubtotal, type CartItem, type ShopState } from "@/lib/shop/store";
import type { ProductSummary } from "@/lib/types/product";
import { Toast, type ToastMessage } from "./toast";

interface ShopContextValue extends ShopState {
  /** false beim SSR/Hydration-Render, true sobald localStorage gelesen wurde */
  hydrated: boolean;
  cartCount: number;
  cartSubtotal: number;
  addToCart: (product: ProductSummary, quantity?: number) => void;
  setQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  /** Überschreibt einzelne Felder eines Warenkorb-Produkts (z. B. nach einem Preis-Check). */
  updateCartProduct: (id: number, patch: Partial<ProductSummary>) => void;
  toggleWishlist: (product: ProductSummary) => void;
  isInWishlist: (id: number) => boolean;
  cartItem: (id: number) => CartItem | undefined;
  notify: (message: ToastMessage) => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

const TOAST_DURATION_MS = 3200;

/** Warenkorb + Wunschliste (localStorage) und ein globaler Toast. */
export function ShopProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(subscribe, getHydrated, getServerHydrated);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((message: ToastMessage) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  const value = useMemo<ShopContextValue>(
    () => ({
      ...state,
      hydrated,
      cartCount: cartCount(state.cart),
      cartSubtotal: cartSubtotal(state.cart),
      addToCart: (product, quantity = 1) => dispatch({ type: "cart/add", product, quantity }),
      setQuantity: (id, quantity) => dispatch({ type: "cart/setQuantity", id, quantity }),
      removeFromCart: (id) => dispatch({ type: "cart/remove", id }),
      clearCart: () => dispatch({ type: "cart/clear" }),
      updateCartProduct: (id, patch) => dispatch({ type: "cart/updateProduct", id, patch }),
      toggleWishlist: (product) => dispatch({ type: "wishlist/toggle", product }),
      isInWishlist: (id) => state.wishlist.some((p) => p.id === id),
      cartItem: (id) => state.cart.find((i) => i.product.id === id),
      notify,
    }),
    [state, hydrated, notify],
  );

  return (
    <ShopContext.Provider value={value}>
      {children}
      <Toast message={toast} onClose={() => setToast(null)} />
    </ShopContext.Provider>
  );
}

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within <ShopProvider>");
  return ctx;
}
