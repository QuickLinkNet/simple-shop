import { notFound } from "next/navigation";

/** Fängt alle unbekannten Pfade unterhalb eines Locales → not-found.tsx des Locales. */
export default function CatchAllPage() {
  notFound();
}
