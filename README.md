# Simple Shop

Probeaufgabe „E-Commerce Product Pages“ – Product Listing Page (PLP) und Product Detail Page (PDP) mit **Next.js 16 (App Router)**, **TypeScript** und **Tailwind CSS 4**. Datenquelle ist die [DummyJSON API](https://dummyjson.com/docs/products).

Die technischen Entscheidungen (Framework-Wahl, Rendering-Strategie, Caching) sind in [DECISIONS.md](./DECISIONS.md) dokumentiert. Die Screendesigns, auf denen das UI basiert, liegen in [`screendesigns/`](./screendesigns).

## Setup

Voraussetzung: **Node.js ≥ 20.9** (entwickelt mit Node 24).

```bash
npm install
npm run dev
```

Anschließend <http://localhost:3000> öffnen (leitet auf `/products` weiter).

### Weitere Scripts

| Script          | Beschreibung                                   |
| --------------- | ---------------------------------------------- |
| `npm run build` | Production-Build inkl. Prerendering            |
| `npm start`     | Production-Server (nach `npm run build`)       |
| `npm run lint`  | ESLint (next/core-web-vitals + TypeScript)     |
| `npm run typecheck` | `tsc --noEmit` (inkl. generierter Route-Typen) |

## Routen

| Route                        | Beschreibung                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `/`                          | Redirect auf `/products`                                                                       |
| `/products`                  | PLP: Grid, Pagination (20/Seite), Kategorie-Filter, Suche – State komplett in der URL         |
| `/products?q=phone&category=smartphones&page=2` | Beispiel-Deep-Link                                                          |
| `/products/[id]`             | PDP: Galerie, Preis/Rabatt, Rating, Beschreibung, Related Products, dynamische Meta-Tags       |
| `/products/9999`             | 404-Handling für nicht existierende Produkte                                                   |

## Projektstruktur

```
src/
├── app/
│   ├── layout.tsx                 # Root-Layout (Header, Footer, Metadata-Template)
│   ├── page.tsx                   # Redirect → /products
│   ├── error.tsx                  # Route-Level Error Boundary
│   ├── not-found.tsx              # Globale 404
│   └── products/
│       ├── page.tsx               # PLP (Server Component + Suspense-Streaming)
│       ├── loading.tsx            # Skeleton für die PLP
│       └── [id]/
│           ├── page.tsx           # PDP + generateMetadata + generateStaticParams
│           ├── loading.tsx        # Skeleton für die PDP
│           └── not-found.tsx      # 404 für unbekannte Produkt-IDs
├── components/
│   ├── layout/                    # Header (mit Suche), Footer, Logo
│   ├── products/                  # ProductCard, ProductGrid, SearchBox, CategoryFilter,
│   │                              # Pagination, ProductGallery, RelatedProducts
│   └── ui/                        # Price, RatingStars
└── lib/
    ├── api/dummyjson.ts           # Typisierter API-Client mit "use cache"
    ├── products/search-params.ts  # URL-State parsen/serialisieren
    ├── types/product.ts           # Typen der API-Responses
    └── format.ts                  # Preis-/Kategorie-Formatierung
```

## Was wurde umgesetzt

**PLP `/products`**

- Server-seitiges Data Fetching, Ergebnis streamt per `<Suspense>` hinter einer statischen Shell
- Client-seitige Suche im Header (debounced Live-Suche auf der PLP, Enter-Navigation von anderen Seiten) und Kategorie-Filter
- Filter- und Pagination-State ausschließlich über URL-Query-Parameter (`q`, `category`, `page`)
- Skeleton-Loading-States, Empty-State, Ellipsen-Pagination

**PDP `/products/[id]`**

- Dynamische Route, Produkt wird server-seitig geladen
- `generateMetadata`: Title, Description, Open Graph, Twitter Card
- Bildergalerie als Client Component (Thumbnails, Pfeile, Tastatur)
- Related Products (gleiche Kategorie) streamen in eigener Suspense-Boundary
- Produktdetails / Versand & Rückgabe als natives `<details>`-Accordion (kein JS nötig)
- `notFound()` bei ungültiger oder unbekannter ID → eigene `not-found.tsx`

**Querschnitt**

- Vollständige Typen für alle genutzten API-Responses, `tsc --strict`
- Caching mit `"use cache"` + `cacheLife()` (Cache Components), Details in `DECISIONS.md`
- `next/image` mit `remotePatterns`, `priority` für LCP-Bilder
- Error Boundary (`error.tsx`) mit Retry
- Barrierefreiheit: Landmarken, `aria-current`, `aria-pressed`, sichtbare Fokus-Zustände, sr-only-Labels
