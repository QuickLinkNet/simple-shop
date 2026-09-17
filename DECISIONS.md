# Technische Entscheidungen

## 1. Framework: Next.js 16 (App Router)

Beide erlaubten Frameworks hätten die Aufgabe gelöst. Für Next.js sprachen:

- **React Server Components** sind die natürliche Antwort auf die Anforderung „Server-seitiges Fetching + Client-seitige Interaktivität“: Datenzugriff bleibt vollständig auf dem Server, nur Suche, Filter-Chips und Galerie werden als Client Components ausgeliefert.
- **Streaming per `<Suspense>`** erlaubt granulare Loading-States ohne zusätzliche Bibliotheken.
- **`generateMetadata`** deckt die SEO-Anforderung (Title, Description, Open Graph) mit Bordmitteln ab.
- **Cache Components** (`"use cache"`, seit Next 16 stabil) machen die Caching-Strategie im Code explizit statt sie in `fetch`-Optionen zu verstecken.

Kein Vite/SPA-Setup: Das würde die geforderte Server-seitige Datenbeschaffung und SEO-Meta-Daten nicht nativ abdecken.

## 2. Rendering-Strategie

`cacheComponents: true` ist aktiviert. Damit gilt: Alles, was nicht von Request-Daten abhängt, wird beim Build in eine **statische Shell** vorgerendert; alles, was von `params`/`searchParams` abhängt, muss in einer `<Suspense>`-Boundary liegen und streamt zur Request-Zeit.

| Route             | Statisch (Shell, pro Sprache)                     | Gestreamt (Request-Zeit)                        |
| ----------------- | ------------------------------------------------- | ----------------------------------------------- |
| `/products`       | Layout, Hero, Überschrift, Kategorie-Chips        | Produktliste + Pagination (abhängig von `searchParams`) |
| `/products/[id]`  | Layout; die ersten 30 Produkte komplett (`generateStaticParams`) | Produktdetails (für nicht vorgerenderte IDs), Related Products |
| `/cart`, `/wishlist` | komplett statisch                              | – (Inhalt kommt aus `localStorage` im Client)   |

**Warum die Produktliste nicht statisch ist:** Sie hängt von Query-Parametern ab. Die Daten dahinter sind aber gecacht (siehe unten), d. h. der Stream ist nach dem ersten Aufruf pro Filter-Kombination sofort verfügbar.

**Related Products** liegen in einer eigenen Suspense-Boundary. Sie brauchen die Kategorie des Produkts und können daher erst nach dem Produkt-Request starten; durch die eigene Boundary blockieren sie das Rendering der Produktdetails nicht.

**Metadata + Page teilen einen Request:** `generateMetadata` und die Page rufen beide `getProduct(id)` auf. Da die Funktion mit `"use cache"` markiert ist, wird der API-Call dedupliziert.

## 3. Caching / Revalidation

Alle Datenfunktionen liegen in `src/lib/api/dummyjson.ts` und sind mit `"use cache"` + `cacheLife()` versehen:

| Funktion                | `cacheLife` | Begründung                                             |
| ----------------------- | ----------- | ------------------------------------------------------ |
| `getProducts(query)`    | `hours`     | Katalog ändert sich selten; Cache-Key = Filter-Objekt  |
| `getProduct(id)`        | `hours`     | Produktdaten; Key = ID                                 |
| `getRelatedProducts()`  | `hours`     | wie oben                                               |
| `getCategories()`       | `days`      | Kategorien ändern sich praktisch nie                   |
| `getProductIds()`       | `days`      | nur für `generateStaticParams`                         |

`cacheLife("hours")` bedeutet: stale nach 5 min (Client), revalidate nach 1 h, expire nach 1 Tag. Der Build-Output zeigt das pro Route (`Revalidate 1h / Expire 1d` für `/products/[id]`).

Für eine echte Shop-Anbindung würde man zusätzlich `cacheTag("product", id)` setzen und per Webhook `revalidateTag()` auslösen – bei DummyJSON gibt es keine Änderungsereignisse, daher rein zeitbasiert.

## 4. URL als Single Source of Truth (PLP)

Filter, Suche, Sortierung und Seite leben ausschließlich in `?q=&category=&sort=&page=`. Es gibt keinen Client-State, der die URL spiegelt:

- `search-params.ts` parst und validiert (`page ≥ 1`, Query max. 100 Zeichen, `sort` gegen eine Whitelist) und serialisiert zurück.
- **Kategorie-Chips und Pagination sind `<Link>`s** – Deep-Link-fähig, prefetchbar, funktionieren ohne JS. Die Sortierung ist ein natives `<select>`, das per `router.replace` in die URL schreibt.
- **Die Suche** ist die einzige Komponente mit lokalem State (Input-Wert). Sie schreibt debounced (300 ms) per `router.replace` in die URL, setzt `page` zurück und zeigt über `useTransition` einen Pending-Indikator. Externe URL-Änderungen (Back-Button) werden ins Feld übernommen.

## 5. Umgang mit API-Einschränkungen

- **Suche + Kategorie gleichzeitig** unterstützt DummyJSON nicht. In diesem Fall wird die vollständige Treffermenge der Suche geladen (`limit=0`), serverseitig nach Kategorie gefiltert und manuell paginiert. Bei < 200 Produkten und gecachtem Ergebnis ist das vertretbar; bei einer echten API wäre das ein Backend-Thema.
- **`select=`** reduziert die Payload der Listen-Endpoints auf die Felder von `ProductSummary`.
- **404** der API wird im Client als `null` gemappt, alle anderen Fehler werfen `ApiError` und landen in `error.tsx`.

## 6. Internationalisierung (DE/EN)

**Anforderung:** Deutsch als Default, Englisch als zweite Sprache – bei gleichbleibenden Routen `/products` und `/products/[id]` aus der Aufgabenstellung.

**Lösung:** Ein `[locale]`-Segment als Root-Layout plus `proxy.ts` (früher Middleware):

| Aufruf            | Verhalten                                                        |
| ----------------- | ---------------------------------------------------------------- |
| `/products`       | interner Rewrite auf `/de/products` – URL bleibt unverändert     |
| `/en/products`    | Englisch, Präfix sichtbar; Cookie `NEXT_LOCALE=en` wird gesetzt  |
| `/de/products`    | Redirect auf `/products` (kanonisch), Cookie `NEXT_LOCALE=de`    |
| `/products` + Cookie `en` | Redirect auf `/en/products`                              |

Der Sprachumschalter verlinkt immer explizit (`/de/…`, `/en/…`), damit der Proxy das Cookie setzen kann. Beide Locales werden per `generateStaticParams` beim Build vorgerendert; `hreflang`-Alternates und `<html lang>` sind pro Sprache gesetzt.

**Kein `next-intl`:** Zwei Sprachen und ein flaches Wörterbuch rechtfertigen keine Abhängigkeit. Die Wörterbücher sind typisiert (`Dictionary = typeof de`, `en: Dictionary`), fehlende Keys fallen beim Typecheck auf. Server Components bekommen `locale`/`dict` als Props, Client Components über einen kleinen Context.

**Grenze:** DummyJSON liefert Produktdaten nur auf Englisch. Übersetzt werden UI-Texte und die 24 Kategorienamen; Titel und Beschreibungen bleiben englisch. Das ist im README explizit dokumentiert.

## 7. Warenkorb & Wunschliste ohne Backend

Die Screendesigns zeigen Warenkorb, Wunschliste und Mengenauswahl. Damit keine „toten“ Buttons ausgeliefert werden, sind sie clientseitig voll funktional:

- **State** liegt in einem externen Store (`lib/shop/external-store.ts`), der per `useSyncExternalStore` in React eingebunden ist. Server-Snapshot ist immer leer → kein Hydration-Mismatch; nach der Hydration wird aus `localStorage` gelesen. Das `storage`-Event synchronisiert mehrere Tabs.
- **Reducer** (`lib/shop/store.ts`) ist eine reine Funktion und damit ohne React testbar. Gelesene Storage-Daten werden defensiv validiert.
- Der Checkout-Button ist bewusst als Demo gekennzeichnet („Checkout ist nicht angebunden“).

## 8. 404-Verhalten

`notFound()` wird innerhalb der Suspense-Boundary geworfen, nachdem die statische Shell bereits gesendet wurde. Next.js rendert dann `not-found.tsx` an Ort und Stelle und injiziert `<meta name="robots" content="noindex">`; der HTTP-Status bleibt jedoch 200. Das ist das dokumentierte Verhalten bei Cache Components und der Preis für die sofort ausgelieferte Shell.

Wäre ein echter 404-Status Pflicht (z. B. für Crawler-Budget), gäbe es zwei Wege: alle Produkt-IDs per `generateStaticParams` vorrendern (bei 194 Produkten machbar) oder auf das klassische dynamische Rendering ohne statische Shell wechseln. Für diese Aufgabe wurde die Streaming-Variante bevorzugt.

Unbekannte Pfade außerhalb der Produktroute (z. B. `/foo/bar`) laufen in eine Catch-all-Route, die `notFound()` wirft, und liefern einen echten HTTP 404.

## 9. Bewusst weggelassen

- **Kein State-Management / Data-Fetching-Library** (SWR, React Query, Zustand): Server Components + URL-State + ein kleiner externer Store reichen aus.
- **Keine E2E-Tests**: Die reine Logik (URL-State, Warenkorb-Reducer, Storage-Validierung, Pagination) ist per Vitest abgedeckt (`npm test`). Ein Playwright-Smoke-Test für Deep-Links und Sprachwechsel wäre der nächste Schritt.
- **Preise in USD**: DummyJSON liefert USD-Werte; eine Umrechnung wäre fachlich falsch. Nur die Formatierung ist lokalisiert (`de-DE` / `en-US`).

## 10. Tooling

- TypeScript `strict`, Route-Typen (`PageProps<"/products/[id]">`) werden von Next generiert (`next typegen`).
- ESLint mit `eslint-config-next` (core-web-vitals + TypeScript).
- Tailwind CSS 4 mit Design-Tokens in `globals.css` (`@theme`), abgeleitet aus den Screendesigns in `screendesigns/`. Keine Komponentenbibliothek.
- Schrift: Outfit via `next/font/google` (self-hosted, kein Layout-Shift).
