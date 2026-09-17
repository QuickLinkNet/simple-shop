"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { CartRevalidateResponse } from "@/lib/shop/revalidate-cart";
import { useShop } from "./shop-provider";

export interface CartNotice {
  id: string;
  text: string;
}

/**
 * Revalidiert den Warenkorb gegen die aktuellen Produktdaten, sobald die
 * Warenkorb-Seite angezeigt wird (nicht bei jedem Seitenaufruf – siehe
 * DECISIONS.md, Abschnitt "Revalidation-Strategie").
 *
 * Der Warenkorb speichert eine Momentaufnahme des Produkts (Titel, Preis,
 * Rabatt) zum Zeitpunkt von "In den Warenkorb", weil er unabhängig von der
 * Server-Cache-Lebensdauer beliebig lange in localStorage liegen kann. Diese
 * Momentaufnahme kann veralten. Beim Öffnen von /cart wird sie deshalb einmal
 * gegen `/api/cart/revalidate` geprüft:
 *
 * - Produkt nicht mehr vorhanden → aus dem Warenkorb entfernen
 * - Bestand kleiner als die gewählte Menge → Menge auf den Bestand kappen
 * - Preis oder Rabatt haben sich geändert → Momentaufnahme aktualisieren
 *
 * In allen Fällen wird der Nutzer per Hinweis informiert, nichts verschwindet
 * unbemerkt.
 */
export function useCartPriceSync() {
  const { locale, dict } = useLocale();
  const { cart, hydrated, updateCartProduct, setQuantity, removeFromCart } = useShop();
  const [notices, setNotices] = useState<CartNotice[]>([]);
  const checkedKey = useRef<string | null>(null);

  // Stabiler Schlüssel: ändert sich nur, wenn Produkte hinzukommen/wegfallen –
  // nicht, wenn nur die Menge oder eine Momentaufnahme aktualisiert wird.
  const idsKey = useMemo(
    () =>
      cart
        .map((i) => i.product.id)
        .sort((a, b) => a - b)
        .join(","),
    [cart],
  );

  useEffect(() => {
    if (!hydrated || idsKey === "" || idsKey === checkedKey.current) return;
    checkedKey.current = idsKey;

    const ids = idsKey.split(",").map(Number);
    let cancelled = false;

    fetch("/api/cart/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((res) => (res.ok ? (res.json() as Promise<CartRevalidateResponse>) : null))
      .then((data) => {
        if (cancelled || !data) return;

        const newNotices: CartNotice[] = [];

        for (const result of data.results) {
          const item = cart.find((i) => i.product.id === result.id);
          if (!item) continue;

          if (!result.found || result.stock <= 0) {
            removeFromCart(result.id);
            newNotices.push({
              id: `removed-${result.id}-${Date.now()}`,
              text: t(dict.cart.itemRemoved, { title: item.product.title }),
            });
            continue;
          }

          const priceChanged =
            item.product.price !== result.price ||
            item.product.discountPercentage !== result.discountPercentage;

          if (priceChanged) {
            updateCartProduct(result.id, {
              price: result.price,
              discountPercentage: result.discountPercentage,
              title: result.title,
            });
            const key: "priceIncreased" | "priceDecreased" =
              result.price > item.product.price ? "priceIncreased" : "priceDecreased";
            newNotices.push({
              id: `price-${result.id}-${Date.now()}`,
              text: t(dict.cart[key], { title: result.title, price: formatPrice(result.price, locale) }),
            });
          }

          if (result.stock < item.quantity) {
            setQuantity(result.id, result.stock);
            newNotices.push({
              id: `stock-${result.id}-${Date.now()}`,
              text: t(dict.cart.quantityReduced, { title: result.title, stock: result.stock }),
            });
          }
        }

        if (newNotices.length > 0) {
          setNotices((prev) => [...prev, ...newNotices]);
        }
      })
      .catch(() => {
        // Best effort: Der Check ist eine Komfortfunktion, kein kritischer Pfad –
        // bei Netzwerkfehlern bleibt der Warenkorb mit den zuletzt bekannten Werten nutzbar.
      });

    return () => {
      cancelled = true;
    };
    // idsKey ist der einzige gewollte Trigger; cart/dict/locale werden nur zum
    // Zeitpunkt des Fetches gelesen, nicht beobachtet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, hydrated]);

  const dismiss = (id: string) => setNotices((prev) => prev.filter((n) => n.id !== id));

  return { notices, dismiss };
}
