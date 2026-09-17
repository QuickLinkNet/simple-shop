import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductGallery } from "@/components/products/product-gallery";
import {
  RelatedProducts,
  RelatedProductsSkeleton,
} from "@/components/products/related-products";
import { DiscountBadge, Price } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { getProduct, getProductIds } from "@/lib/api/dummyjson";
import { formatCategory, truncate } from "@/lib/format";
import { buildProductsHref } from "@/lib/products/search-params";
import type { AvailabilityStatus, Product } from "@/lib/types/product";
import { ProductDetailSkeleton } from "./loading";

type Params = PageProps<"/products/[id]">["params"];

/** "12" → 12, alles andere → null (führt zu 404). */
function parseProductId(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number.parseInt(raw, 10) : null;
}

async function resolveProduct(params: Params): Promise<Product | null> {
  const { id } = await params;
  const productId = parseProductId(id);
  return productId === null ? null : getProduct(productId);
}

/** Die ersten Produkte werden beim Build vorgerendert, der Rest on demand (ISR). */
export async function generateStaticParams() {
  const ids = await getProductIds(30);
  return ids.map((id) => ({ id: String(id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  // getProduct ist gecacht → kein zweiter API-Call gegenüber der Page.
  const product = await resolveProduct(params);

  if (!product) {
    return { title: "Produkt nicht gefunden" };
  }

  const description = truncate(product.description);

  return {
    title: product.title,
    description,
    openGraph: {
      type: "website",
      title: product.title,
      description,
      images: product.images.slice(0, 1).map((url) => ({
        url,
        alt: product.title,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: product.images.slice(0, 1),
    },
  };
}

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}

async function ProductDetail({ params }: { params: Params }) {
  const product = await resolveProduct(params);
  if (!product) notFound();

  const category = formatCategory(product.category);
  const categoryHref = buildProductsHref({ category: product.category });

  return (
    <article className="flex flex-col gap-14">
      <div className="flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/products" },
            { label: category, href: categoryHref },
            { label: product.title },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[55fr_45fr] lg:gap-14">
          <ProductGallery images={product.images} title={product.title} />

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              {product.brand && (
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-ink-muted">
                  {product.brand}
                </p>
              )}
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-brand-800 sm:text-5xl">
                {product.title}
              </h1>
            </div>

            <RatingStars
              rating={product.rating}
              count={product.reviews.length}
              variant="full"
            />

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-3">
                <Price
                  price={product.price}
                  discountPercentage={product.discountPercentage}
                  size="lg"
                />
                <DiscountBadge percentage={product.discountPercentage} size="lg" />
              </div>
              <p className="text-sm text-ink-muted">inkl. MwSt., zzgl. Versandkosten</p>
            </div>

            <Availability status={product.availabilityStatus} stock={product.stock} />

            <p className="text-lg leading-relaxed">{product.description}</p>

            {product.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Tags">
                {product.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-border-strong bg-surface-elevated px-4 py-1.5 text-sm"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            <p className="flex items-center gap-3 text-sm">
              <svg
                aria-hidden
                className="size-6 text-brand-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M3 7h11v9H3V7Zm11 3h4l3 3v3h-7v-6ZM7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {product.shippingInformation}
            </p>

            <div className="mt-2 border-t border-border">
              <Accordion title="Produktdetails" defaultOpen>
                <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-sm">
                  <Detail label="Artikelnummer" value={product.sku} />
                  <Detail label="Kategorie" value={category} />
                  <Detail label="Gewicht" value={`${product.weight} g`} />
                  <Detail
                    label="Maße"
                    value={`${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} cm`}
                  />
                  <Detail label="Mindestmenge" value={`${product.minimumOrderQuantity} Stück`} />
                </dl>
              </Accordion>
              <Accordion title="Versand & Rückgabe">
                <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-sm">
                  <Detail label="Versand" value={product.shippingInformation} />
                  <Detail label="Garantie" value={product.warrantyInformation} />
                  <Detail label="Rückgabe" value={product.returnPolicy} />
                </dl>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Streamt unabhängig vom Rest der Seite */}
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts
          category={product.category}
          categoryLabel={category}
          categoryHref={categoryHref}
          excludeId={product.id}
        />
      </Suspense>
    </article>
  );
}

function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-border">
      <summary className="flex cursor-pointer items-center justify-between py-4 text-base font-semibold">
        {title}
        <span
          aria-hidden
          className="accordion-icon text-2xl font-light leading-none text-ink-muted transition"
        >
          +
        </span>
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-ink-muted">{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

const AVAILABILITY: Record<AvailabilityStatus, { className: string; label: string }> = {
  "In Stock": { className: "text-success", label: "Auf Lager" },
  "Low Stock": { className: "text-warning", label: "Nur noch wenige verfügbar" },
  "Out of Stock": { className: "text-danger", label: "Ausverkauft" },
};

function Availability({
  status,
  stock,
}: {
  status: AvailabilityStatus;
  stock: number;
}) {
  const info = AVAILABILITY[status] ?? AVAILABILITY["In Stock"];
  return (
    <p className="flex items-center gap-2.5 text-base font-medium">
      <span aria-hidden className={`size-3 rounded-full bg-current ${info.className}`} />
      {info.label}
      {stock > 0 && (
        <span className="text-sm font-normal text-ink-muted">({stock} Stück)</span>
      )}
    </p>
  );
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition hover:text-ink">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="text-ink">
                  {item.label}
                </span>
              )}
              {!isLast && <span aria-hidden>›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
