"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/locale-provider";
import { localePath } from "@/lib/i18n/config";

export default function ProductNotFound() {
  const { locale, dict } = useLocale();

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-ink-muted">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{dict.product.notFoundTitle}</h1>
      <p className="mt-2 text-ink-muted">{dict.product.notFoundText}</p>
      <Link
        href={localePath(locale, "/products")}
        className="mt-6 inline-flex h-11 items-center rounded-full bg-brand-700 px-6 text-sm font-semibold text-surface-elevated transition hover:bg-brand-800"
      >
        {dict.product.backToList}
      </Link>
    </div>
  );
}
