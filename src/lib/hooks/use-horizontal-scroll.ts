"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Teilt sich ProductSlider und CategoryFilter: verfolgt, ob in einem horizontal
 * scrollbaren Container noch nach links/rechts gescrollt werden kann (für
 * Pfeil-Buttons und Fade-Kanten), reagiert auf Resize und Scroll-Events.
 */
export function useHorizontalScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  const scrollByAmount = useCallback((amount: number) => {
    ref.current?.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  return { ref, canScrollPrev, canScrollNext, onScroll: update, scrollByAmount };
}
