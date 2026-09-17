import { ProductGridSkeleton } from "@/components/products/product-grid";
import { PAGE_SIZE } from "@/lib/api/dummyjson";

export default function ProductsLoading() {
  return (
    <div className="flex flex-col gap-8" role="status" aria-label="Produkte werden geladen">
      <div className="skeleton h-72 rounded-3xl lg:h-80" />
      <div className="flex flex-col gap-5">
        <div className="flex items-end justify-between">
          <div className="skeleton h-10 w-72" />
          <div className="skeleton h-4 w-40" />
        </div>
        <div className="skeleton h-10 w-full rounded-full" />
        <ProductGridSkeleton count={PAGE_SIZE} />
      </div>
    </div>
  );
}
