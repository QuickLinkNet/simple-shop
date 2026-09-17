"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { t } from "@/lib/i18n";

const IMAGES = ["/hero.jpg", "/hero-2.jpg", "/hero-3.jpg"];
const AUTOPLAY_MS = 6000;

/**
 * Hero-Karussell: 3 Folien (Text kommt aus dem Wörterbuch, siehe DECISIONS.md
 * für die Foto-Frage). Autoplay pausiert bei Hover/Fokus und respektiert
 * prefers-reduced-motion; Punkte + Pfeile sind vollwertige Steuerung, nicht
 * nur Deko.
 */
export function HeroSlider() {
  const { dict } = useLocale();
  const slides = dict.plp.heroSlides;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const go = (next: number) => setIndex((next + slides.length) % slides.length);
  const slide = slides[index];

  return (
    <section
      aria-label="Intro"
      aria-roledescription="Karussell"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative grid overflow-hidden rounded-3xl bg-brand-800 text-surface-elevated lg:grid-cols-[1.1fr_1fr]"
    >
      <div className="relative z-10 flex flex-col justify-center gap-4 px-6 py-10 sm:px-10 lg:py-16">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-highlight">
          {slide.kicker}
        </p>
        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          {slide.title1}
          <br />
          {slide.title2}
        </h1>
        <p className="text-lg text-surface-elevated/80">{slide.subtitle}</p>
        <a
          href="#shop-heading"
          className="group mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-highlight px-5 py-3 text-sm font-semibold text-brand-800 transition hover:bg-highlight-strong"
        >
          {dict.plp.heroCta}
          <span aria-hidden className="transition group-hover:translate-x-1">
            →
          </span>
        </a>

        <div
          className="mt-4 flex items-center gap-2"
          role="tablist"
          aria-label={dict.plp.pagination}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(index + 1);
            if (e.key === "ArrowLeft") go(index - 1);
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={t(dict.plp.slideGoTo, { index: i + 1 })}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-highlight" : "w-4 bg-surface-elevated/30 hover:bg-surface-elevated/50"
              }`}
            />
          ))}
          <span className="ml-2 text-xs text-surface-elevated/60">
            {t(dict.plp.slideOf, { current: index + 1, total: slides.length })}
          </span>
        </div>
      </div>

      <div className="relative h-48 sm:h-64 lg:h-auto">
        {IMAGES.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className={`object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <span
          aria-hidden
          className="absolute right-4 top-4 rounded-md border border-surface-elevated/40 bg-brand-800/60 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.25em] backdrop-blur-sm sm:right-6 sm:top-6"
        >
          {dict.plp.heroBadge}
        </span>
        <span
          aria-hidden
          className="absolute bottom-4 right-4 hidden text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-surface-elevated/70 [writing-mode:vertical-rl] sm:block"
        >
          {dict.plp.heroSideLabel}
        </span>
      </div>
    </section>
  );
}
