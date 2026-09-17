import type { CSSProperties } from "react";

interface MarqueeProps {
  items: readonly string[];
}

// Genug Wiederholungen, damit eine Hälfte des Bands auch auf sehr breiten
// Displays (4K/Ultrawide) niemals ausgeht. Mit 3 Phrasen pro Item-Liste sind
// das 3 × 12 = 36 Einträge pro Hälfte – bei Weitem breiter als jeder reale
// Viewport, unabhängig von Sprache/Textlänge.
const MIN_REPEATS = 12;
// Sekunden, die EIN Durchlauf der Original-Item-Liste zum Durchscrollen
// braucht. Die Gesamtdauer skaliert mit MIN_REPEATS, sonst würde ein
// längerer Track bei fixer Dauer einfach schneller statt gleich schnell laufen.
const SECONDS_PER_REPEAT = 28;

/**
 * Endlos-Laufband, rein dekorativ (aria-hidden). Verschiebt per CSS-Keyframe
 * um -50% – dadurch entsteht eine nahtlose Schleife, ohne JavaScript.
 * Respektiert prefers-reduced-motion (siehe globals.css).
 *
 * Zwei Dinge mussten stimmen, damit das wirklich nahtlos wirkt:
 *
 * 1. Der Abstand zwischen den Elementen sitzt als `mr-*` AN JEDEM Element
 *    selbst, nicht als `gap` auf dem Elternteil. Bei `gap` läge zwischen der
 *    letzten Kopie und der ersten Wiederholung derselbe Abstand wie überall
 *    sonst – die Verdopplung wäre dann nicht exakt symmetrisch zur
 *    50%-Marke (ein halber Gap Versatz), wodurch die Schleife bei jedem
 *    Durchlauf sichtbar ruckelt.
 * 2. Eine Hälfte des Bands muss BREITER als der Viewport sein, sonst geht
 *    dem Band schlicht der Inhalt aus, bevor es den rechten Rand erreicht –
 *    das sah bei nur 3 kurzen Phrasen (verdoppelt) auf normalen Desktop-
 *    Breiten wie eine leere Lücke aus. Deshalb `MIN_REPEATS` statt einfacher
 *    Verdopplung.
 */
export function Marquee({ items }: MarqueeProps) {
  const track = Array.from({ length: MIN_REPEATS }, () => items).flat();
  const doubled = [...track, ...track];

  return (
    <div aria-hidden className="overflow-hidden bg-highlight py-3 text-brand-800">
      <div
        style={{ "--marquee-duration": `${MIN_REPEATS * SECONDS_PER_REPEAT}s` } as CSSProperties}
        className="animate-marquee flex w-max whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em]"
      >
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
