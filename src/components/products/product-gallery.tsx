"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

/**
 * Bildergalerie: Hauptbild + Thumbnails, per Klick oder Pfeiltasten wechselbar.
 * Client Component wegen lokalem UI-State.
 */
export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  const hasMultiple = images.length > 1;

  const go = (next: number) =>
    setIndex((next + images.length) % images.length);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface"
        onKeyDown={(e) => {
          if (!hasMultiple) return;
          if (e.key === "ArrowRight") go(index + 1);
          if (e.key === "ArrowLeft") go(index - 1);
        }}
        tabIndex={hasMultiple ? 0 : undefined}
        aria-roledescription={hasMultiple ? "Galerie" : undefined}
        aria-label={hasMultiple ? `Bild ${index + 1} von ${images.length}` : undefined}
      >
        <Image
          key={current}
          src={current}
          alt={`${title} – Bild ${index + 1}`}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-contain p-6"
        />

        {hasMultiple && (
          <>
            <GalleryArrow direction="prev" onClick={() => go(index - 1)} />
            <GalleryArrow direction="next" onClick={() => go(index + 1)} />
          </>
        )}
      </div>

      {hasMultiple && (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Weitere Bilder">
          {images.map((src, i) => {
            const isActive = i === index;
            return (
              <li key={src} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Bild ${i + 1} anzeigen`}
                  aria-pressed={isActive}
                  className={`relative size-16 overflow-hidden rounded-lg border-2 bg-surface transition sm:size-20 ${
                    isActive
                      ? "border-brand-600"
                      : "border-border hover:border-brand-500"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
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
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "Vorheriges Bild" : "Nächstes Bild"}
      className={`absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/90 text-lg shadow-card transition hover:bg-surface ${
        isPrev ? "left-3" : "right-3"
      }`}
    >
      <span aria-hidden>{isPrev ? "‹" : "›"}</span>
    </button>
  );
}
