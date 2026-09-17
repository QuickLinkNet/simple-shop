import { ProductGridSkeleton } from "@/components/products/product-grid";
import { PAGE_SIZE } from "@/lib/api/dummyjson";

export default function ProductsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Produkte</h1>
        <div className="skeleton h-10 w-full sm:max-w-sm" />
      </div>
      <div className="skeleton h-9 w-full" />
      <ProductGridSkeleton count={PAGE_SIZE} />
    </div>
  );
}
