import type { Dictionary, Locale } from "@/lib/i18n";
import { Logo } from "./logo";

const TRUST_ICONS = [
  <path key="leaf" d="M5 19c0-7 4-12 14-14-1 9-5 13-11 14m0 0 3-5" />,
  <path key="box" d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v9m0 0 8-4.5M12 12 4 7.5" />,
  <path key="lock" d="M7 10V8a5 5 0 0 1 10 0v2m-11 0h12v10H6V10Zm6 4v3" />,
];

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const trust = [dict.footer.trust1, dict.footer.trust2, dict.footer.trust3];

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

        <div className="flex flex-col gap-3 border-t border-border py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Logo locale={locale} label={dict.header.logoLabel} size="sm" />
            <p>© 2026 Simple Shop</p>
          </div>
          <p>
            {dict.footer.task} · {dict.footer.dataFrom}{" "}
            <a
              href="https://dummyjson.com"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:text-ink hover:underline"
            >
              DummyJSON
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
