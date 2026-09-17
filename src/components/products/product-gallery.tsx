"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { ChevronIcon } from "@/components/ui/icons";
import { t } from "@/lib/i18n";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

/**
 * Bildergalerie: Hauptbild + Thumbnails, per Klick oder Pfeiltasten wechselbar.
 * Client Component wegen lokalem UI-State.
 */
export function ProductGallery({ images, title }: ProductGalleryProps) {
  const { dict } = useLocale();
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  const hasMultiple = images.length > 1;

  const go = (next: number) => setIndex((next + images.length) % images.length);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-surface-muted"
        onKeyDown={(e) => {
          if (!hasMultiple) return;
          if (e.key === "ArrowRight") go(index + 1);
          if (e.key === "ArrowLeft") go(index - 1);
        }}
        tabIndex={hasMultiple ? 0 : undefined}
        aria-roledescription={hasMultiple ? dict.product.gallery : undefined}
        aria-label={
          hasMultiple ? t(dict.product.imageOf, { index: index + 1, total: images.length }) : undefined
        }
      >
        <Image
          key={current}
          src={current}
          alt={t(dict.product.imageAlt, { title, index: index + 1 })}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-contain p-8"
        />

        {hasMultiple && (
          <>
            <GalleryArrow direction="prev" label={dict.product.prevImage} onClick={() => go(index - 1)} />
            <GalleryArrow direction="next" label={dict.product.nextImage} onClick={() => go(index + 1)} />
          </>
        )}
      </div>

      {hasMultiple && (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label={dict.product.moreImages}>
          {images.map((src, i) => {
            const isActive = i === index;
            return (
              <li key={src} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={t(dict.product.showImage, { index: i + 1 })}
                  aria-pressed={isActive}
                  className={`relative size-18 overflow-hidden rounded-xl border-2 bg-surface-muted transition sm:size-24 ${
                    isActive ? "border-brand-700" : "border-transparent hover:border-border-strong"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="96px" className="object-contain p-2" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function GalleryArrow({
  direction,
  label,
  onClick,
}: {
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-surface-elevated/95 shadow-float transition hover:bg-surface-elevated ${
        isPrev ? "left-4" : "right-4"
      }`}
    >
      <ChevronIcon direction={isPrev ? "left" : "right"} className="size-5" />
    </button>
  );
}
