import { redirect } from "next/navigation";
import { isLocale, localePath } from "@/lib/i18n";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  redirect(localePath(isLocale(locale) ? locale : "de", "/products"));
}
