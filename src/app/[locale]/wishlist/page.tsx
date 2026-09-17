import type { Metadata } from "next";
import { WishlistView } from "@/components/shop/wishlist-view";
import { getDictionary, isLocale } from "@/lib/i18n";

type Props = PageProps<"/[locale]/wishlist">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "de");
  return { title: dict.wishlist.title, robots: { index: false } };
}

/** Wunschliste lebt komplett im Client (localStorage) – die Seite ist eine statische Shell. */
export default function WishlistPage() {
  return <WishlistView />;
}
