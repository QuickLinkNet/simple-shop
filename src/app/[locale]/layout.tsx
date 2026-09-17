import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { notFound } from "next/navigation";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ShopProvider } from "@/components/shop/shop-provider";
import { LOCALES, getDictionary, isLocale, localePath } from "@/lib/i18n";
import "../globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Beide Locales werden beim Build vorgerendert (statische Shell pro Sprache). */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  return {
    title: {
      default: dict.meta.siteName,
      template: `%s | ${dict.meta.siteName}`,
    },
    description: dict.meta.description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, localePath(l, "/")])),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} className={`${outfit.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <LocaleProvider locale={locale} dict={dict}>
          <ShopProvider>
            <Header locale={locale} dict={dict} />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer locale={locale} dict={dict} />
          </ShopProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
