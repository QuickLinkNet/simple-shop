import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from "@/lib/i18n/config";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Locale-Routing ohne Präfix für die Default-Sprache:
 *   /products      → intern /de/products (URL bleibt, wie in der Aufgabe gefordert)
 *   /en/products   → Englisch, Präfix sichtbar
 *   /de/products   → Redirect auf /products (kanonisch), Cookie = de
 * Ein explizit gewähltes Locale wird per Cookie gemerkt und beim nächsten
 * präfixlosen Aufruf angewendet.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const [, first = "", ...rest] = pathname.split("/");

  if (isLocale(first)) {
    const restPath = `/${rest.join("/")}`;

    if (first === DEFAULT_LOCALE) {
      const response = NextResponse.redirect(
        new URL(`${restPath}${search}`, request.url),
      );
      setLocaleCookie(response, first);
      return response;
    }

    const response = NextResponse.next();
    setLocaleCookie(response, first);
    return response;
  }

  const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
  if (preferred && isLocale(preferred) && preferred !== DEFAULT_LOCALE) {
    return NextResponse.redirect(
      new URL(`/${preferred}${pathname}${search}`, request.url),
    );
  }

  return NextResponse.rewrite(
    new URL(`/${DEFAULT_LOCALE}${pathname}${search}`, request.url),
  );
}

function setLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}

export const config = {
  // Statische Assets, Bild-Optimizer und Dateien mit Endung auslassen
  matcher: ["/((?!_next|api|favicon\\.ico|.*\\..*).*)"],
};
