/** Typen für die DummyJSON Products API – https://dummyjson.com/docs/products */

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductMeta {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
}

export type AvailabilityStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: ProductDimensions;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: AvailabilityStatus;
  reviews: ProductReview[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: ProductMeta;
  images: string[];
  thumbnail: string;
}

/** Felder, die für die Listen-Ansicht (PLP, Related Products) benötigt werden. */
export type ProductSummary = Pick<
  Product,
  | "id"
  | "title"
  | "category"
  | "price"
  | "discountPercentage"
  | "rating"
  | "thumbnail"
  | "brand"
>;

export const PRODUCT_SUMMARY_FIELDS = [
  "id",
  "title",
  "category",
  "price",
  "discountPercentage",
  "rating",
  "thumbnail",
  "brand",
] as const satisfies readonly (keyof ProductSummary)[];

export interface ProductListResponse<T = ProductSummary> {
  products: T[];
  total: number;
  skip: number;
  limit: number;
}

/** Slug einer Kategorie, z. B. "mens-shirts". */
export type CategorySlug = string;
