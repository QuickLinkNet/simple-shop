const priceFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

/** Preis vor Rabatt, auf 2 Nachkommastellen gerundet. */
export function originalPrice(
  price: number,
  discountPercentage: number,
): number {
  if (discountPercentage <= 0) return price;
  return Math.round((price / (1 - discountPercentage / 100)) * 100) / 100;
}

/** "mens-shirts" wird zu "Mens Shirts" */
export function formatCategory(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function truncate(text: string, max = 160): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
