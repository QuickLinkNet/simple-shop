import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCart } from "@/components/products/add-to-cart";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductReviews } from "@/components/products/product-reviews";
import {
  RelatedProducts,
  RelatedProductsSkeleton,
} from "@/components/products/related-products";
import { TruckIcon } from "@/components/ui/icons";
import { DiscountBadge, Price } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { getProduct, getProductIds } from "@/lib/api/dummyjson";
import { truncate } from "@/lib/format";
import {
  LOCALES,
  type Dictionary,
  type Locale,
  categoryLabel,
  getDictionary,
  isLocale,
  localePath,
  t,
} from "@/lib/i18n";
import { buildProductsHref } from "@/lib/products/search-params";
import type { AvailabilityStatus, Product, ProductSummary } from "@/lib/types/product";
import { ProductDetailSkeleton } from "./loading";

type Props = PageProps<"/[locale]/products/[id]">;
type Params = Props["params"];

/** "12" → 12, alles andere → null (führt zu 404). */
function parseProductId(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number.parseInt(raw, 10) : null;
}

async function resolve(params: Params): Promise<{ locale: Locale; product: Product | null }> {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "de";
  const productId = parseProductId(id);
  const product = productId === null ? null : await getProduct(productId);
  return { locale, product };
}

/** Die ersten Produkte werden pro Locale beim Build vorgerendert, der Rest on demand (ISR). */
export async function generateStaticParams() {
  const ids = await getProductIds(30);
  return LOCALES.flatMap((locale) => ids.map((id) => ({ locale, id: String(id) })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // getProduct ist gecacht → kein zweiter API-Call gegenüber der Page.
  const { locale, product } = await resolve(params);
  const dict = getDictionary(locale);

  if (!product) {
    return { title: dict.meta.productNotFound };
  }

  const description = truncate(product.description);
  const path = `/products/${product.id}`;

  return {
    title: product.title,
    description,
    alternates: {
      canonical: localePath(locale, path),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)])),
    },
    openGraph: {
      type: "website",
      title: product.title,
      description,
      locale: locale === "de" ? "de_DE" : "en_US",
      images: product.images.slice(0, 1).map((url) => ({ url, alt: product.title })),
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: product.images.slice(0, 1),
    },
  };
}

export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}

async function ProductDetail({ params }: { params: Params }) {
  const { locale, product } = await resolve(params);
  if (!product) notFound();

  const dict = getDictionary(locale);
  const category = categoryLabel(dict, product.category);
  const summary: ProductSummary = {
    id: product.id,
    title: product.title,
    category: product.category,
    price: product.price,
    discountPercentage: product.discountPercentage,
    rating: product.rating,
    thumbnail: product.thumbnail,
    brand: product.brand,
  };

  return (
    <article className="flex flex-col gap-14">
      <div className="flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: dict.product.home, href: localePath(locale, "/products") },
            { label: category, href: buildProductsHref(locale, { category: product.category }) },
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

            <a
              href="#reviews"
              aria-label={dict.product.jumpToReviews}
              className="inline-flex w-fit transition hover:opacity-80"
            >
              <RatingStars rating={product.rating} count={product.reviews.length} variant="full" />
            </a>

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-3">
                <Price price={product.price} discountPercentage={product.discountPercentage} size="lg" />
                <DiscountBadge percentage={product.discountPercentage} size="lg" />
              </div>
              <p className="text-sm text-ink-muted">{dict.product.vatNote}</p>
            </div>

            <Availability dict={dict} status={product.availabilityStatus} stock={product.stock} />

            <p className="text-lg leading-relaxed">{product.description}</p>

            {product.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label={dict.product.tags}>
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

            <AddToCart product={summary} stock={product.stock} />

            <p className="flex items-center gap-3 text-sm">
              <TruckIcon className="size-6 text-brand-700" />
              {product.shippingInformation}
            </p>

            <div className="mt-2 border-t border-border">
              <Accordion title={dict.product.details} defaultOpen>
                <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-sm">
                  <Detail label={dict.product.sku} value={product.sku} />
                  <Detail label={dict.product.category} value={category} />
                  {product.brand && <Detail label={dict.product.brand} value={product.brand} />}
                  <Detail label={dict.product.weight} value={`${product.weight} g`} />
                  <Detail
                    label={dict.product.dimensions}
                    value={`${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} cm`}
                  />
                  <Detail
                    label={dict.product.minOrder}
                    value={t(dict.product.pieces, { count: product.minimumOrderQuantity })}
                  />
                </dl>
              </Accordion>
              <Accordion title={dict.product.shippingReturns}>
                <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-sm">
                  <Detail label={dict.product.shipping} value={product.shippingInformation} />
                  <Detail label={dict.product.warranty} value={product.warrantyInformation} />
                  <Detail label={dict.product.returns} value={product.returnPolicy} />
                </dl>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews locale={locale} dict={dict} reviews={product.reviews} />

      {/* Streamt unabhängig vom Rest der Seite */}
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts
          locale={locale}
          dict={dict}
          category={product.category}
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
        <span aria-hidden className="accordion-icon text-2xl font-light leading-none text-ink-muted transition">
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

const AVAILABILITY: Record<AvailabilityStatus, { className: string; key: "inStock" | "lowStock" | "outOfStock" }> = {
  "In Stock": { className: "text-success", key: "inStock" },
  "Low Stock": { className: "text-warning", key: "lowStock" },
  "Out of Stock": { className: "text-danger", key: "outOfStock" },
};

function Availability({
  dict,
  status,
  stock,
}: {
  dict: Dictionary;
  status: AvailabilityStatus;
  stock: number;
}) {
  const info = AVAILABILITY[status] ?? AVAILABILITY["In Stock"];
  return (
    <p className="flex items-center gap-2.5 text-base font-medium">
      <span aria-hidden className={`size-3 rounded-full bg-current ${info.className}`} />
      {dict.product[info.key]}
      {stock > 0 && (
        <span className="text-sm font-normal text-ink-muted">
          ({t(dict.product.pieces, { count: stock })})
        </span>
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
