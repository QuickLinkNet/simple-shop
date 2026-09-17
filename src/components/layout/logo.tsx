import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md";
}

/** Wortmarke nach Screendesign: grünes Quadrat mit S + "simple / SHOP". */
export function Logo({ size = "md" }: LogoProps) {
  const box = size === "md" ? "size-11 text-2xl" : "size-8 text-base";
  const word = size === "md" ? "text-2xl" : "text-lg";
  const sub = size === "md" ? "text-[0.6rem]" : "text-[0.5rem]";

  return (
    <Link
      href="/products"
      aria-label="Simple Shop – zur Startseite"
      className="flex items-center gap-2.5"
    >
      <span
        aria-hidden
        className={`grid place-items-center rounded-xl bg-brand-700 font-bold text-surface-elevated ${box}`}
      >
        S
      </span>
      <span aria-hidden className="flex flex-col leading-none">
        <span className={`font-bold tracking-tight text-brand-700 ${word}`}>
          simple
        </span>
        <span
          className={`self-end font-semibold uppercase tracking-[0.3em] text-brand-700 ${sub}`}
        >
          Shop
        </span>
      </span>
    </Link>
  );
}
