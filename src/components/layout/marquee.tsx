interface MarqueeProps {
  items: readonly string[];
}

/**
 * Endlos-Laufband, rein dekorativ (aria-hidden). Verdoppelt die Items und
 * verschiebt per CSS-Keyframe um -50% – dadurch entsteht eine nahtlose
 * Schleife, ohne JavaScript. Respektiert prefers-reduced-motion (siehe
 * globals.css).
 *
 * Wichtig: Der Abstand zwischen den Elementen sitzt als `mr-*` AN JEDEM
 * Element selbst, nicht als `gap` auf dem Elternteil. Bei `gap` läge zwischen
 * der letzten Kopie und der ersten Wiederholung derselbe Abstand wie überall
 * sonst – die Verdopplung wäre dann nicht exakt symmetrisch zur 50%-Marke
 * (ein halber Gap Versatz), wodurch die Schleife bei jedem Durchlauf sichtbar
 * ruckelt/springt statt nahtlos zu wirken.
 */
export function Marquee({ items }: MarqueeProps) {
  const doubled = [...items, ...items];

  return (
    <div aria-hidden className="overflow-hidden bg-highlight py-3 text-brand-800">
      <div className="animate-marquee flex w-max whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em]">
        {doubled.map((item, i) => (
          <span key={i} className="mr-8 flex shrink-0 items-center gap-2">
            {item}
            <span aria-hidden>✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}
