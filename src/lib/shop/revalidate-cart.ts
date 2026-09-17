/** Geteilter Vertrag zwischen der Cart-Revalidate-Route und dem Client-Hook. */

export interface CartRevalidateRequest {
  ids: number[];
}

export type CartRevalidateEntry =
  | {
      id: number;
      found: true;
      title: string;
      price: number;
      discountPercentage: number;
      stock: number;
    }
  | { id: number; found: false };

export interface CartRevalidateResponse {
  results: CartRevalidateEntry[];
}

export const MAX_REVALIDATE_IDS = 50;
