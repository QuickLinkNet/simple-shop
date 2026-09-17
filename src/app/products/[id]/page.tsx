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

  return (
    <article className="flex flex-col gap-10">
      <Breadcrumb
        items={[
          { label: "Produkte", href: "/products" },
          { label: category, href: buildProductsHref({ category: product.category }) },
          { label: product.title },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[55fr_45fr] lg:gap-12">
        <ProductGallery images={product.images} title={product.title} />

        <div className="flex flex-col gap-5">
          <div>
            {product.brand && (
              <p className="text-sm font-medium uppercase tracking-wide text-ink-muted">
                {product.brand}
              </p>
            )}
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              {product.title}
            </h1>
          </div>

          <RatingStars
            rating={product.rating}
            count={product.reviews.length}
            size="md"
          />

          <div className="flex items-center gap-3">
            <Price
              price={product.price}
              discountPercentage={product.discountPercentage}
              size="lg"
            />
            <DiscountBadge percentage={product.discountPercentage} />
          </div>

          <Availability status={product.availabilityStatus} stock={product.stock} />

          <p className="leading-relaxed text-ink">{product.description}</p>

          {product.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Tags">
              {product.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-surface-muted px-3 py-1 text-xs text-ink-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-xl border border-border bg-surface p-4 text-sm">
            <Detail label="Versand" value={product.shippingInformation} />
            <Detail label="Garantie" value={product.warrantyInformation} />
            <Detail label="Rückgabe" value={product.returnPolicy} />
            <Detail label="Artikelnr." value={product.sku} />
          </dl>
        </div>
      </div>

      {/* Streamt unabhängig vom Rest der Seite */}
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts category={product.category} excludeId={product.id} />
      </Suspense>
    </article>
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
    <p className={`flex items-center gap-2 text-sm font-medium ${info.className}`}>
      <span aria-hidden className="size-2 rounded-full bg-current" />
      {info.label}
      {stock > 0 && <span className="font-normal text-ink-muted">({stock} Stück)</span>}
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
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
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
