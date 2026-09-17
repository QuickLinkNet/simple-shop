# Simple Shop

Probeaufgabe „E-Commerce Product Pages“ – Product Listing Page (PLP) und Product Detail Page (PDP) mit **Next.js 16 (App Router)**, **TypeScript** und **Tailwind CSS 4**. Datenquelle ist die [DummyJSON API](https://dummyjson.com/docs/products).

Die technischen Entscheidungen (Framework-Wahl, Rendering-Strategie, Caching, i18n) sind in [DECISIONS.md](./DECISIONS.md) dokumentiert. Die Screendesigns, auf denen das UI basiert, liegen in [`screendesigns/`](./screendesigns).

## Setup

Voraussetzung: **Node.js ≥ 20.9** (entwickelt mit Node 24, siehe `.nvmrc`).

```bash
npm install
npm run dev
```

Anschließend <http://localhost:3000> öffnen (leitet auf `/products` weiter).

### Weitere Scripts

| Script              | Beschreibung                                       |
| ------------------- | -------------------------------------------------- |
| `npm run build`     | Production-Build inkl. Prerendering                |
| `npm start`         | Production-Server (nach `npm run build`)           |
| `npm run lint`      | ESLint (next/core-web-vitals + TypeScript)         |
| `npm run typecheck` | `next typegen` + `tsc --noEmit`                    |
| `npm test`          | Unit-Tests (Vitest) für URL-State, Warenkorb-Reducer, Pagination |

## Routen

| Route                                            | Beschreibung                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `/`                                              | Redirect auf `/products`                                                        |
| `/products`                                      | PLP (Deutsch): Grid, Pagination (20/Seite), Kategorie-Filter, Suche, Sortierung |
| `/products?q=phone&category=smartphones&sort=price-asc&page=2` | Beispiel-Deep-Link – der komplette Filter-State liegt in der URL |
| `/products/[id]`                                 | PDP: Galerie, Preis/Rabatt, Rating, Warenkorb, Related-Slider, dynamische Meta-Tags |
| `/cart`, `/wishlist`                             | Warenkorb und Wunschliste (Client-State in `localStorage`)                      |
| `/en/...`                                        | Dieselben Seiten auf Englisch (Sprachwechsel oben rechts)                       |
| `/products/9999`, `/irgendwas`                   | 404-Handling                                                                    |

## Projektstruktur

```
src/
├── proxy.ts                        # Locale-Routing: /products → /de/products (Rewrite), Cookie
├── app/
│   ├── globals.css                 # Tailwind + Design-Tokens (@theme)
│   └── [locale]/
│       ├── layout.tsx              # Root-Layout pro Sprache (Header, Footer, Provider)
│       ├── page.tsx                # Redirect → /products
│       ├── error.tsx               # Route-Level Error Boundary
│       ├── not-found.tsx           # 404 (lokalisiert)
│       ├── [...rest]/page.tsx      # Catch-all → notFound()
│       ├── products/
│       │   ├── page.tsx            # PLP (Server Component + Suspense-Streaming)
│       │   ├── loading.tsx         # Skeleton
│       │   └── [id]/               # PDP + generateMetadata + generateStaticParams, 404
│       ├── cart/page.tsx           # Warenkorb
│       └── wishlist/page.tsx       # Wunschliste
├── components/
│   ├── layout/                     # Header (Suche, Badges, Sprachwechsel), Footer, Logo
│   ├── products/                   # ProductCard, Grid, Slider, Gallery, Filter, Sort, Pagination, AddToCart
│   ├── shop/                       # ShopProvider (Warenkorb/Wunschliste), CartView, WishlistView, Toast
│   ├── i18n/                       # LocaleProvider (Client-Context)
│   └── ui/                         # Price, RatingStars, Icons
└── lib/
    ├── api/dummyjson.ts            # Typisierter API-Client mit "use cache"
    ├── i18n/                       # Locale-Config, Wörterbücher (de/en), t()
    ├── products/search-params.ts   # URL-State parsen/serialisieren (Filter, Sort, Page)
    ├── shop/                       # Reducer, externer Store (useSyncExternalStore + localStorage)
    ├── types/product.ts            # Typen der API-Responses
    └── format.ts                   # Preis-/Zahlen-Formatierung
```

## Was wurde umgesetzt

**PLP `/products`**

- Server-seitiges Data Fetching, Ergebnis streamt per `<Suspense>` hinter einer statischen Shell
- Client-seitige Suche im Header (debounced Live-Suche auf der PLP, Enter-Navigation von anderen Seiten)
- Kategorie-Chips, Sortierung (Preis, Bewertung, Name) und Pagination – **alles ausschließlich über URL-Query-Parameter** (`q`, `category`, `sort`, `page`)
- Skeleton-Loading-States, Empty-State, Ellipsen-Pagination

**PDP `/products/[id]`**

- Dynamische Route, Produkt wird server-seitig geladen; die ersten 30 Produkte pro Sprache werden beim Build vorgerendert
- `generateMetadata`: Title, Description, Open Graph, Twitter Card, `hreflang`-Alternates
- Bildergalerie als Client Component (Thumbnails, Pfeile, Tastatur)
- Mengen-Stepper, „In den Warenkorb“, Wunschliste, Sticky-Kaufleiste auf Mobile
- Related Products als Scroll-Snap-Slider, gestreamt in eigener Suspense-Boundary
- Produktdetails / Versand & Rückgabe als natives `<details>`-Accordion (kein JS nötig)
- `notFound()` bei ungültiger oder unbekannter ID → eigene `not-found.tsx`

**Shop-Funktionen (ohne Backend)**

- Warenkorb und Wunschliste in `localStorage`, tab-übergreifend synchronisiert, Badges im Header, Toast-Feedback
- Warenkorb-Seite mit Mengenänderung, Entfernen, Zwischensumme, Versandkosten-Logik (kostenlos ab 75 $)

**Internationalisierung**

- Deutsch (Default, ohne URL-Präfix) und Englisch (`/en/…`), Umschalter im Header, Wahl wird per Cookie gemerkt
- UI-Texte und Kategorienamen übersetzt. **Produkttitel und -beschreibungen kommen von DummyJSON und sind nur auf Englisch verfügbar.**

**Querschnitt**

- Vollständige Typen für alle genutzten API-Responses, `tsc --strict`, typisierte Wörterbücher
- Caching mit `"use cache"` + `cacheLife()` (Cache Components), Details in `DECISIONS.md`
- `next/image` mit `remotePatterns`, `priority` für LCP-Bilder
- Error Boundary (`error.tsx`) mit Retry
- Barrierefreiheit: Landmarken, `aria-current`, `aria-pressed`, `aria-live` für Toasts, sichtbare Fokus-Zustände, sr-only-Labels
