import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/config";
import { Logo } from "./logo";

const TRUST_ICONS = [
  <path key="leaf" d="M5 19c0-7 4-12 14-14-1 9-5 13-11 14m0 0 3-5" />,
  <path key="box" d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v9m0 0 8-4.5M12 12 4 7.5" />,
  <path key="lock" d="M7 10V8a5 5 0 0 1 10 0v2m-11 0h12v10H6V10Zm6 4v3" />,
];

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const trust = [dict.footer.trust1, dict.footer.trust2, dict.footer.trust3];

  // Bewusst nur echte Ziele – kein "Kontakt/Datenschutz/Impressum" ohne
  // dahinterliegende Seite, damit keine toten Links entstehen.
  const nav = [
    { label: dict.footer.navProducts, href: localePath(locale, "/products") },
    { label: dict.footer.navWishlist, href: localePath(locale, "/wishlist") },
    { label: dict.footer.navCart, href: localePath(locale, "/cart") },
  ];

  return (
    <footer className="mt-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="grid gap-4 border-t border-border py-8 sm:grid-cols-3 sm:divide-x sm:divide-border">
          {trust.map((label, i) => (
            <li key={label} className="flex items-center justify-center gap-3 text-sm font-medium">
              <svg
                aria-hidden
                className="size-7 text-brand-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {TRUST_ICONS[i]}
              </svg>
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-brand-800 text-surface-elevated">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <div className="flex flex-col gap-3">
            <Logo locale={locale} label={dict.header.logoLabel} size="sm" variant="light" />
            <p className="text-sm text-surface-elevated/70">{dict.footer.tagline}</p>
          </div>

          <nav aria-label={dict.footer.navProducts} className="flex gap-8 text-sm">
            <ul className="flex flex-col gap-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-surface-elevated/80 transition hover:text-surface-elevated">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="max-w-[16rem] -rotate-1 text-lg italic text-highlight lg:text-right">
            <span aria-hidden className="mr-1 not-italic">
              ✳
            </span>
            {dict.footer.quote}
          </p>
        </div>

        <div className="border-t border-surface-elevated/10">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-surface-elevated/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>© 2026 Simple Shop</p>
            <p>
              {dict.footer.task} · {dict.footer.dataFrom}{" "}
              <a
                href="https://dummyjson.com"
                target="_blank"
                rel="noreferrer"
                className="underline-offset-2 hover:text-surface-elevated hover:underline"
              >
                DummyJSON
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
