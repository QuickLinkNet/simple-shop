import { RelatedProductsSkeleton } from "@/components/products/related-products";

export function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col gap-14" role="status" aria-busy>
      <div className="flex flex-col gap-6">
        <div className="skeleton h-4 w-64" />
        <div className="grid gap-8 lg:grid-cols-[55fr_45fr] lg:gap-14">
          <div className="flex flex-col gap-3">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="skeleton size-18 sm:size-24" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-12 w-4/5" />
            </div>
            <div className="skeleton h-5 w-40" />
            <div className="skeleton h-11 w-44" />
            <div className="skeleton h-4 w-32" />
            <div className="flex flex-col gap-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
            </div>
            <div className="skeleton h-14 w-full rounded-2xl" />
            <div className="skeleton h-28 w-full rounded-xl" />
          </div>
        </div>
      </div>
      <RelatedProductsSkeleton />
    </div>
  );
}

export default function ProductLoading() {
  return <ProductDetailSkeleton />;
}
