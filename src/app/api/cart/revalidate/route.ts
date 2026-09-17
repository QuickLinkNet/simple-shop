import { NextResponse } from "next/server";
import { getProduct } from "@/lib/api/dummyjson";
import {
  MAX_REVALIDATE_IDS,
  type CartRevalidateEntry,
  type CartRevalidateRequest,
  type CartRevalidateResponse,
} from "@/lib/shop/revalidate-cart";

/**
 * Preis-/Bestandscheck für Warenkorb-Positionen.
 *
 * POST-Handler sind in Next.js nie Teil der statischen Shell (nur GET kann mit
 * Cache Components prerendert werden) – hier ist das gewollt, denn die Antwort
 * hängt von den IDs im Request-Body ab. `getProduct` selbst ist weiterhin mit
 * `"use cache"` markiert, der Check liest also aus demselben Ein-Stunden-Cache
 * wie der Rest der App (siehe DECISIONS.md, Abschnitt "Revalidation-Strategie").
 */
export async function POST(request: Request): Promise<NextResponse<CartRevalidateResponse>> {
  const body = (await request.json().catch(() => null)) as CartRevalidateRequest | null;
  const ids = Array.isArray(body?.ids) ? body.ids : [];

  const uniqueIds = [...new Set(ids)]
    .filter((id) => Number.isInteger(id) && id > 0)
    .slice(0, MAX_REVALIDATE_IDS);

  const results: CartRevalidateEntry[] = await Promise.all(
    uniqueIds.map(async (id): Promise<CartRevalidateEntry> => {
      const product = await getProduct(id);
      if (!product) return { id, found: false };
      return {
        id,
        found: true,
        title: product.title,
        price: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
      };
    }),
  );

  return NextResponse.json({ results });
}
