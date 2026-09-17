"use client";

import { useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}

/**
 * True erst, nachdem DIESE Komponenteninstanz ihren eigenen Client-Render
 * abgeschlossen hat.
 *
 * Anders als der globale `hydrated`-Flag aus `useShop()`: Next.js hydriert
 * per Suspense gestreamte Teile der Seite zeitversetzt. Eine Komponente tief
 * in einer solchen Boundary (z. B. `WishlistButton` in der per Suspense
 * gestreamten Produktliste) kann erst hydrieren, NACHDEM der globale Store
 * (im Root-Layout, außerhalb jeder Boundary) bereits aus localStorage gelesen
 * und aktualisiert hat. Für diese späte Komponente ist der globale Flag dann
 * schon `true`, obwohl ihr eigenes SSR-HTML noch mit `false` gerendert wurde
 * – Ergebnis: ein Hydration-Mismatch.
 *
 * `useSyncExternalStore` mit fixem Server-Snapshot `false` garantiert, dass
 * JEDE Komponenteninstanz unabhängig von ihrem eigenen Hydration-Zeitpunkt
 * beim ersten Client-Render `false` liefert (identisch zur SSR-Ausgabe) und
 * erst danach auf `true` wechselt – ganz gleich, wann im Baum sie hydriert.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}
