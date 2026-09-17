"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { ChevronIcon } from "@/components/ui/icons";
import { useHorizontalScroll } from "@/lib/hooks/use-horizontal-scroll";
import type { ProductSummary } from "@/lib/types/product";
import { ProductCard } from "./product-card";

interface ProductSliderProps {
  products: ProductSummary[];
  /** Überschrift + optionaler Link rechts daneben */
  heading: React.ReactNode;
  headingId: string;
  aside?: React.ReactNode;
}

/**
 * Horizontaler Slider mit CSS Scroll-Snap. Pfeile scrollen um eine "Seite";
 * ohne JS bleibt der Inhalt per Touch/Trackpad scrollbar.
 */
export function ProductSlider({ products, heading, headingId, aside }: ProductSliderProps) {
  const { dict } = useLocale();
  const { ref: trackRef, canScrollPrev: canPrev, canScrollNext: canNext, onScroll: updateButtons } =
    useHorizontalScroll<HTMLUListElement>();

  // Scrollt um so viele ganze Karten, wie sichtbar sind (bleibt am Snap-Raster)
  const scrollByPage = (direction: 1 | -1) => {
    const el = trackRef.current;
    const item = el?.querySelector("li");
    if (!el || !item) return;
    const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = item.offsetWidth + gap;
    const visible = Math.max(1, Math.floor((el.clientWidth + gap) / step));
    el.scrollBy({ left: direction * step * visible, behavior: "smooth" });
  };

  const arrow = (direction: 1 | -1, enabled: boolean, label: string) => (
    <button
      type="button"
      onClick={() => scrollByPage(direction)}
      disabled={!enabled}
      aria-label={label}
      className="grid size-11 place-items-center rounded-full border border-border-strong bg-surface-elevated transition hover:border-brand-700 hover:text-brand-700 disabled:cursor-default disabled:opacity-30 disabled:hover:border-border-strong disabled:hover:text-ink"
    >
      <ChevronIcon direction={direction === 1 ? "right" : "left"} className="size-5" />
    </button>
  );

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id={headingId} className="text-3xl font-bold tracking-tight sm:text-4xl">
          {heading}
        </h2>
        <div className="flex items-center gap-4">
          {aside}
          <div className="hidden items-center gap-2 sm:flex">
            {arrow(-1, canPrev, dict.product.sliderPrev)}
            {arrow(1, canNext, dict.product.sliderNext)}
          </div>
        </div>
      </div>

      <ul
        ref={trackRef}
        onScroll={updateButtons}
        className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <li
            key={product.id}
            className="w-[70%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-3.75rem)/4)]"
          >
            <ProductCard
              product={product}
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 70vw"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
