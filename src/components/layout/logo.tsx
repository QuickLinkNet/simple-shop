import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n/config";

interface LogoProps {
  locale: Locale;
  label: string;
  size?: "sm" | "md";
  /** "light": für dunkle Hintergründe (Footer) – heller Text statt Markengrün. */
  variant?: "dark" | "light";
}

/** Wortmarke nach Screendesign: grünes Quadrat mit S + "simple / SHOP". */
export function Logo({ locale, label, size = "md", variant = "dark" }: LogoProps) {
  const box = size === "md" ? "size-11 text-2xl" : "size-8 text-base";
  const word = size === "md" ? "text-2xl" : "text-lg";
  const sub = size === "md" ? "text-[0.6rem]" : "text-[0.5rem]";
  const wordColor = variant === "light" ? "text-surface-elevated" : "text-brand-700";
  const boxClass = variant === "light" ? "bg-surface-elevated text-brand-800" : "bg-brand-700 text-surface-elevated";

  return (
    <Link
      href={localePath(locale, "/products")}
      aria-label={label}
      className="flex shrink-0 items-center gap-2.5"
    >
      <span aria-hidden className={`grid place-items-center rounded-xl font-bold ${boxClass} ${box}`}>
        S
      </span>
      <span aria-hidden className="flex flex-col leading-none">
        <span className={`font-bold tracking-tight ${wordColor} ${word}`}>simple</span>
        <span className={`self-end font-semibold uppercase tracking-[0.3em] ${wordColor} ${sub}`}>
          Shop
        </span>
      </span>
    </Link>
  );
}
