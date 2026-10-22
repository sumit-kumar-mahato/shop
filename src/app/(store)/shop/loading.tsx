export default function ShopLoading() {
  return (
    <div className="container-page pt-14" aria-busy="true" aria-label="Loading products">
      <div className="shimmer h-4 w-24 animate-shimmer rounded" />
      <div className="shimmer mt-4 h-14 w-72 animate-shimmer rounded" />
      <div className="mt-14 grid gap-10 lg:grid-cols-[250px_1fr]">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="shimmer h-4 animate-shimmer rounded" style={{ width: `${50 + ((i * 17) % 40)}%` }} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:gap-x-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="shimmer aspect-[3/4] animate-shimmer rounded-sm" />
              <div className="shimmer mt-4 h-4 w-3/4 animate-shimmer rounded" />
              <div className="shimmer mt-2 h-4 w-1/3 animate-shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
