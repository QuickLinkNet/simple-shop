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

## 3. Revalidation-Strategie

Zwei unabhängige Datentöpfe müssen aktuell gehalten werden: der **Server-Cache** der Produktdaten und der **Client-Zustand** (Warenkorb/Wunschliste), der beliebig lange in `localStorage` überdauert. Beide werden unterschiedlich behandelt.

### 3.1 Server-seitig: zeitbasiert mit `cacheLife`

Alle Datenfunktionen liegen in `src/lib/api/dummyjson.ts` und sind mit `"use cache"` + `cacheLife()` versehen:

| Funktion                | `cacheLife` | Begründung                                             |
| ----------------------- | ----------- | ------------------------------------------------------ |
| `getProducts(query)`    | `hours`     | Katalog ändert sich selten; Cache-Key = Filter-Objekt  |
| `getProduct(id)`        | `hours`     | Produktdaten; Key = ID                                 |
| `getRelatedProducts()`  | `hours`     | wie oben                                               |
| `getCategories()`       | `days`      | Kategorien ändern sich praktisch nie                   |
| `getProductIds()`       | `days`      | nur für `generateStaticParams`                         |

`cacheLife("hours")` bedeutet konkret: **stale** nach 5 Minuten (der Browser hält ein per Prefetch geladenes Ergebnis so lange für "frisch genug"), **revalidate** nach 1 Stunde (der Server holt beim nächsten Request neue Daten und ersetzt den Cache-Eintrag), **expire** nach 1 Tag (harte Obergrenze, danach wird auf jeden Fall neu geladen). Der Build-Output weist das pro Route aus (`Revalidate 1h / Expire 1d` für `/products/[id]`).

Für eine echte Backend-Anbindung würde man zusätzlich `cacheTag("product", id)` setzen und per Webhook `revalidateTag()` auslösen, sobald sich ein Produkt ändert (event-basiert statt nur zeitbasiert). DummyJSON hat keine solchen Change-Events, daher bleibt es hier bei der zeitbasierten Strategie – der Erweiterungspunkt ist aber vorbereitet (eine Zeile pro Funktion).

### 3.2 Client-seitig: das Warenkorb-Problem

**Die Frage, die sich stellt:** Der Warenkorb liegt in `localStorage` und kann tagelang bestehen bleiben – deutlich länger als der 1-Stunden-Server-Cache. Beim Hinzufügen wird eine *Momentaufnahme* des Produkts gespeichert (Titel, Preis, Rabatt, Bild), nicht nur die ID. Ändert sich der Preis in der Zwischenzeit (bei DummyJSON simuliert, in echt: Sale endet, Preis wird korrigiert, Produkt wird ausverkauft), zeigt der Warenkorb einen veralteten Stand – klassisches Cache-Invalidation-Problem, nur eine Ebene höher als der Server-Cache.

**Lösung – Revalidation beim Betreten von `/cart`, nicht bei jedem Request:**

1. `CartView` ruft den Hook `useCartPriceSync()` auf (`components/shop/use-cart-price-sync.ts`).
2. Der Hook sendet die IDs aller Warenkorb-Positionen an `POST /api/cart/revalidate`.
3. Die Route liest die aktuellen Werte über das **gleiche** gecachte `getProduct()` – der Check ist also höchstens so alt wie der Server-Cache (≤ 1 h), aber garantiert nicht älter, unabhängig davon, wie lange das Item schon im Warenkorb liegt.
4. Der Client vergleicht Feld für Feld und reagiert:

   | Server sagt …                        | Reaktion                                                        |
   | ------------------------------------- | ----------------------------------------------------------------- |
   | Produkt existiert nicht mehr / `stock = 0` | Position wird entfernt, Hinweis „… ist nicht mehr verfügbar“ |
   | `stock` < gewählte Menge               | Menge wird auf `stock` gekappt, Hinweis mit neuer Menge          |
   | `price` / `discountPercentage` geändert | Momentaufnahme wird aktualisiert, Hinweis mit altem→neuem Preis |

5. Alle Änderungen laufen über `dispatch({ type: "cart/updateProduct", … })` im selben Reducer wie alle anderen Warenkorb-Aktionen (`lib/shop/store.ts`) – keine Sonderlogik, kein zweiter State.

**Bewusste Entscheidungen dabei:**

- **Kein automatisches Verschwinden ohne Hinweis.** Jede Änderung erzeugt eine sichtbare, einzeln schließbare Meldung im Warenkorb (`aria-live="polite"`), nichts wird stillschweigend korrigiert.
- **Trigger ist der Seitenaufruf, nicht Polling.** Ein Warenkorb-Icon mit permanentem Live-Preis wäre unnötiger Traffic für eine Aufgabe ohne echtes Backend; das Nachschlagen genau dann, wenn der Nutzer den Warenkorb ansieht (vor dem gedachten Checkout), ist der Punkt, an dem es zählt – vergleichbar mit dem Preis-Refresh großer Shops beim Öffnen des Warenkorbs.
- **Re-Check nur, wenn sich die Artikel-Menge ändert**, nicht bei jeder Mengen-Änderung: Der Hook merkt sich die zuletzt geprüfte ID-Kombination (`idsKey`) und fragt erst wieder an, wenn ein Produkt hinzukommt oder wegfällt – eine Mengenänderung im Warenkorb selbst löst keinen erneuten Server-Call aus.
- **Fehlertoleranz:** Schlägt der Revalidate-Call fehl (offline, API down), bleibt der Warenkorb mit dem letzten bekannten Stand nutzbar; es ist eine Komfortfunktion, kein kritischer Pfad.

## 4. URL als Single Source of Truth (PLP)

Filter, Suche, Sortierung und Seite leben ausschließlich in `?q=&category=&sort=&page=`. Es gibt keinen Client-State, der die URL spiegelt:

- `search-params.ts` parst und validiert (`page ≥ 1`, Query max. 100 Zeichen, `sort` gegen eine Whitelist) und serialisiert zurück.
- **Kategorie-Chips und Pagination sind `<Link>`s** – Deep-Link-fähig, prefetchbar, funktionieren ohne JS. Die Sortierung ist ein natives `<select>`, das per `router.replace` in die URL schreibt.
- Bei 24 Kategorien würden umbrechende Chips mehrzeilig und unruhig wirken. Die Zeile ist deshalb **immer einzeilig und horizontal scrollbar** (Muster großer Shops wie Zalando/Amazon), mit Fade-Kanten und Pfeil-Buttons ab `sm` (`lib/hooks/use-horizontal-scroll.ts`, geteilt mit dem Related-Products-Slider); auf Touch reicht Wischen.
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
- **Wie mit veralteten Warenkorb-Daten umgegangen wird** (Preisänderungen, Ausverkauf), steht in Abschnitt 3.2 (Revalidation-Strategie).
- Der Checkout-Button ist bewusst als Demo gekennzeichnet („Checkout ist nicht angebunden“).

## 8. 404-Verhalten

`notFound()` wird innerhalb der Suspense-Boundary geworfen, nachdem die statische Shell bereits gesendet wurde. Next.js rendert dann `not-found.tsx` an Ort und Stelle und injiziert `<meta name="robots" content="noindex">`; der HTTP-Status bleibt jedoch 200. Das ist das dokumentierte Verhalten bei Cache Components und der Preis für die sofort ausgelieferte Shell.

Wäre ein echter 404-Status Pflicht (z. B. für Crawler-Budget), gäbe es zwei Wege: alle Produkt-IDs per `generateStaticParams` vorrendern (bei 194 Produkten machbar) oder auf das klassische dynamische Rendering ohne statische Shell wechseln. Für diese Aufgabe wurde die Streaming-Variante bevorzugt.

Unbekannte Pfade außerhalb der Produktroute (z. B. `/foo/bar`) laufen in eine Catch-all-Route, die `notFound()` wirft, und liefern einen echten HTTP 404.

## 9. Bewusst weggelassen

- **Kein State-Management / Data-Fetching-Library** (SWR, React Query, Zustand): Server Components + URL-State + ein kleiner externer Store reichen aus.
- **Keine E2E-Tests**: Die reine Logik (URL-State, Warenkorb-Reducer, Storage-Validierung, Pagination) ist per Vitest abgedeckt (`npm test`). Ein Playwright-Smoke-Test für Deep-Links und Sprachwechsel wäre der nächste Schritt.
- **Kein Payment-Provider / echte Wechselkurs-API**: siehe Abschnitt 12 (Preise/Währung) für die EUR-Umrechnung mit fest hinterlegtem Kurs statt Live-Anbindung.

## 10. Tooling

- TypeScript `strict`, Route-Typen (`PageProps<"/products/[id]">`) werden von Next generiert (`next typegen`).
- ESLint mit `eslint-config-next` (core-web-vitals + TypeScript).
- Tailwind CSS 4 mit Design-Tokens in `globals.css` (`@theme`), abgeleitet aus den Screendesigns in `screendesigns/`. Keine Komponentenbibliothek.
- Schrift: Outfit via `next/font/google` (self-hosted, kein Layout-Shift).

## 11. Breakpoints

Drei feste, überall gleich verwendete Breakpoints statt einer beliebigen Mischung aus Tailwinds fünf Stufen (`sm`/`md`/`lg`/`xl`/`2xl`):

| Name        | Breite         | Tailwind-Prefix | Typisches Gerät              |
| ----------- | -------------- | ---------------- | ----------------------------- |
| **Mobile**  | < 640 px       | *(kein Prefix)*  | Smartphone, Hochformat        |
| **Tablet**  | ≥ 640 px       | `sm:`            | Tablet, kleines Notebook      |
| **Desktop** | ≥ 1024 px      | `lg:`            | Laptop, Desktop-Monitor       |

**Warum genau drei:** Zwischenstufen wie `md` (768 px) oder `xl` (1280 px) klingen erstmal nach mehr Kontrolle, führten hier aber nur zu uneinheitlichen Rastern – z. B. hatte das Produkt-Grid ursprünglich vier verschiedene Spaltenzahlen über vier Breakpoints (1 → 2 → 3 → 4), während die PDP nur bei `lg` umbricht. Ergebnis: unvorhersehbares Verhalten je nach Bildschirmbreite und mehr Fälle zum Testen. Mit drei Stufen hat jede Komponente maximal drei Zustände, die sich manuell durchklicken lassen.

**Wo `sm` und `lg` konkret etwas ändern:**

| Bereich                     | Mobile              | Tablet (`sm`)          | Desktop (`lg`)         |
| --------------------------- | ------------------- | ----------------------- | ----------------------- |
| Produkt-Grid (PLP/Wunschliste) | 1 Spalte          | 2 Spalten                | 4 Spalten                |
| Related-Products-Slider      | 1 Karte + Anschnitt | 2 Karten                 | 4 Karten                 |
| Header                       | Logo/Suche/Icons umbrechen zweizeilig | einzeilig | – |
| PDP-Layout                   | Galerie über Infos gestapelt | – | Galerie/Infos nebeneinander (55/45) |
| Warenkorb                    | Liste über Summary gestapelt | – | Liste/Summary nebeneinander, Summary sticky |
| Bildergalerie-Thumbnails     | `size-18`            | –                        | `size-24`                |

Getestet wird an drei konkreten Fensterbreiten: **375 px** (Mobile, iPhone-Standardbreite), **768 px** (Tablet, oberhalb der 640-px-Schwelle) und **1280 px** (Desktop, oberhalb der 1024-px-Schwelle) – nicht nur an den exakten Breakpoint-Grenzen, sondern jeweils deutlich darüber, damit auch Zwischenzustände auffallen.

## 12. Preise & Währung

Deutsch zeigt Preise in **EUR**, Englisch in **USD** (DummyJSONs Ursprungswährung). Die Umrechnung passiert an genau einer Stelle, `formatPrice()` in `lib/format.ts`:

```ts
const USD_TO_EUR_RATE = 0.92; // fest hinterlegt, siehe unten
```

**Warum ein fester statt ein live abgefragter Kurs:** Es gibt keine echte Zahlungsabwicklung in diesem Projekt – ein Wechselkurs, der nur zur Anzeige dient, rechtfertigt keinen zusätzlichen externen API-Call (und damit einen weiteren Fehlerfall: Was zeigt man, wenn die Kurs-API nicht antwortet?). Für eine Produktivanbindung wäre der nächste Schritt ein täglich aktualisierter Kurs (z. B. EZB-Referenzkurs), serverseitig mit `cacheLife("days")` gecacht – exakt das gleiche Muster wie bei den Produktdaten.

**Wichtig für die Konsistenz:** Alle *internen Berechnungen* (Versandkosten-Schwelle, Warenkorb-Summen, Preisvergleich bei der Revalidation) laufen weiterhin in **USD**, dem Rohwert aus der API. Nur `formatPrice()` rechnet für die Anzeige um. Dadurch bleibt z. B. die 75-USD-Freigrenze für kostenlosen Versand exakt, unabhängig vom Kurs – angezeigt wird sie lokalisiert (`formatPrice(FREE_SHIPPING_THRESHOLD, locale)`), sodass Text und Betrag nie auseinanderlaufen können.

## 13. Paralleles Data Fetching

Die Aufgabenstellung nennt als Beispiel „Produkt + Related Products gleichzeitig laden". Das haben wir bewusst **nicht** als `Promise.all([getProduct(id), getRelatedProducts(...)])` umgesetzt – aus einem inhaltlichen, nicht nur technischen Grund: `getRelatedProducts` braucht die Kategorie des Produkts als Parameter. Die kennen wir erst, nachdem `getProduct` aufgelöst hat. Ein echtes `Promise.all` von Anfang an würde bedeuten, entweder zu raten oder auf einen zweiten Request zu verzichten – beides schlechter als die jetzige Lösung.

**Was wir stattdessen machen** – und was für den Nutzer tatsächlich schneller ist:

- Die Produktdetails rendern in ihrer eigenen `<Suspense>`-Boundary und sind sichtbar, sobald `getProduct` fertig ist.
- Related Products stecken in einer **zweiten, unabhängigen** `<Suspense>`-Boundary weiter unten auf der Seite und laden nach, ohne die Produktdetails zu blockieren.

Das ist eigentlich das bessere Muster als erzwungenes `Promise.all`: Bei `Promise.all` müsste der Nutzer auf die langsamere der beiden Anfragen warten, bevor überhaupt etwas erscheint. Mit getrennten Suspense-Boundaries sieht er die Produktdetails sofort, während „Ähnliche Produkte" im Hintergrund nachlädt.

**Wo im Projekt tatsächlich parallel gefetcht wird:**

- `/api/cart/revalidate` prüft alle Warenkorb-Positionen mit einem echten `Promise.all(ids.map(id => getProduct(id)))` – hier gibt es keine Abhängigkeit zwischen den Requests, paralleles Fetching ist also die richtige Wahl (siehe `src/app/api/cart/revalidate/route.ts`).
- Auf der PLP fragen `<ResultSummary>` (Trefferzahl) und `<ProductList>` (Grid) beide `getProducts(filters)` ab. Sie stehen als Geschwister-Suspense-Boundaries im Baum und lösen dadurch ebenfalls parallel auf – React wartet nicht, bis die eine fertig ist, bevor die andere startet. Da `getProducts` mit `"use cache"` markiert ist, wird der zweite Aufruf zusätzlich dedupliziert.

## 14. Redesign (zweite Design-Iteration)

Ein zweites Screendesign kam später dazu (Akzentfarbe Lime, Hero-Karussell, Marquee-Leiste, Quick-Add auf den Cards). Umgesetzt, mit ein paar bewussten Anpassungen an die reale Datenlage:

- **Hero-Karussell:** 3 Folien, Text aus dem Wörterbuch (`dict.plp.heroSlides`), Autoplay (pausiert bei Hover/Fokus, respektiert `prefers-reduced-motion`), Punkte sind echte Tabs (`role="tablist"`, Pfeiltasten-Navigation), nicht nur Deko. Zwei der drei Fotos sind Zuschnitt-Varianten desselben Ausgangsbilds (`hero-2.jpg`, `hero-3.jpg`) – für drei komplett unterschiedliche Foto-Motive bräuchte es zusätzliche Bildgenerierung, die aus Zeitgründen in dieser Iteration nicht mehr passierte.
- **Header-Navigation:** Die Mockup-Kategorien „Beauty/Wohnen/Technik" existieren als solche nicht in den DummyJSON-Kategorien. Statt sie zu erfinden, verlinkt die Navigation auf reale Slugs (`beauty`, `furniture`, `laptops`) und zeigt sie über `categoryLabel()` lokalisiert an – funktioniert in beiden Sprachen, keine Fake-Kategorie.
- **„Bestseller"/„Neu"-Badges** aus dem Mockup wurden nicht übernommen: DummyJSON hat kein entsprechendes Feld, ein erfundenes Label wäre eine unbelegte Marketing-Aussage. Der echte, datenbasierte Rabatt-Badge (`discountPercentage`) blieb.
- **Footer-Links:** Nur echte Ziele (`/products`, `/wishlist`, `/cart`) statt der Mockup-Punkte „Kontakt/Datenschutz/Impressum", für die es keine Seiten gibt – tote Links wären schlechter als weniger Links.
- **Quick-Add-Button** auf der Card legt direkt in den Warenkorb (ruft dieselbe `addToCart()`-Funktion wie die PDP auf), ohne zur Detailseite zu navigieren; `preventDefault`/`stopPropagation`, da die Card selbst einen deckenden Link auf die PDP hat.

**Bekannte Einschränkung (dokumentiert, nicht "weggefixt"):** Ein Produkt, das gleichzeitig (a) bereits auf der Wunschliste steht und (b) Teil der per Suspense gestreamten Produktliste ist, kann beim ersten Laden kurz eine Hydration-Mismatch-Warnung in der Konsole auslösen (React vergleicht den serverseitig immer leeren Zustand mit dem lokal gespeicherten). Der sichtbare Zustand bleibt dabei serverseitig (nicht gemerkt) stehen, bis die nächste Interaktion oder Navigation ihn korrigiert – keine kaputte Funktion, nur ein Konsolen-Warnhinweis in einem schmalen Grenzfall. Ursache ist ein Timing-Detail zwischen `useSyncExternalStore` und per Suspense zeitversetzt hydrierenden Komponenten; eine sauberere Lösung wäre, den Warenkorb-/Wunschlisten-State über einen Server-Cookie statt ausschließlich `localStorage` zu spiegeln, was eine größere Änderung wäre, als es der Rahmen dieser Aufgabe hergibt.
