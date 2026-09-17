interface MarqueeProps {
  items: readonly string[];
}

/**
 * Endlos-Laufband, rein dekorativ (aria-hidden). Verdoppelt die Items und
 * verschiebt per CSS-Keyframe um -50% – dadurch entsteht eine nahtlose Schleife,
 * ohne JavaScript. Respektiert prefers-reduced-motion (siehe globals.css).
 */
export function Marquee({ items }: MarqueeProps) {
  const doubled = [...items, ...items];

  return (
    <div aria-hidden className="overflow-hidden bg-highlight py-3 text-brand-800">
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em]">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-8">
            {item}
            <span aria-hidden>✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}
