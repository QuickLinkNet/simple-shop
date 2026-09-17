import { Logo } from "./logo";

const TRUST_ITEMS = [
  {
    label: "Mit Sorgfalt ausgewählt",
    icon: (
      <path d="M5 19c0-7 4-12 14-14-1 9-5 13-11 14m0 0 3-5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    label: "30 Tage Rückgabe",
    icon: (
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v9m0 0 8-4.5M12 12 4 7.5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    label: "Sicher bezahlen",
    icon: (
      <path d="M7 10V8a5 5 0 0 1 10 0v2m-11 0h12v10H6V10Zm6 4v3" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
];

export function Footer() {
  return (
    <footer className="mt-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="grid gap-4 border-t border-border py-8 sm:grid-cols-3 sm:divide-x sm:divide-border">
          {TRUST_ITEMS.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-center gap-3 text-sm font-medium"
            >
              <svg
                aria-hidden
                className="size-7 text-brand-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                {item.icon}
              </svg>
              {item.label}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 border-t border-border py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <p>© 2026 Simple Shop</p>
          </div>
          <p>
            Probeaufgabe Frontend · Daten von{" "}
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
