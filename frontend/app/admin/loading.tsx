export default function Loading() {
  return (
    <div>
      <div className="h-8 w-40 animate-pulse rounded bg-line/50" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-line/50" />
        ))}
      </div>
      <div className="mt-6 h-64 animate-pulse rounded-xl bg-line/50" />
    </div>
  );
}
