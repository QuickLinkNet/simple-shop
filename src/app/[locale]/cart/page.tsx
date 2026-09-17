import type { Metadata } from "next";
import { CartView } from "@/components/shop/cart-view";
import { getDictionary, isLocale } from "@/lib/i18n";

type Props = PageProps<"/[locale]/cart">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "de");
  return { title: dict.cart.title, robots: { index: false } };
}

/** Warenkorb lebt komplett im Client (localStorage) – die Seite ist eine statische Shell. */
export default function CartPage() {
  return <CartView />;
}
