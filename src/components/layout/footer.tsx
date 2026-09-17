export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Simple Shop – Probeaufgabe Frontend (Next.js App Router)</p>
        <p>
          Daten:{" "}
          <a
            href="https://dummyjson.com"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:underline"
          >
            DummyJSON
          </a>
        </p>
      </div>
    </footer>
  );
}
