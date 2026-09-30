export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
      <div className="h-8 w-40 animate-pulse rounded bg-line/50" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="animate-pulse rounded-2xl border border-line bg-surface p-2.5 sm:p-4">
            <div className="aspect-square rounded-xl bg-line/50" />
            <div className="mt-3 h-4 w-3/4 rounded bg-line/50" />
            <div className="mt-2 h-4 w-1/3 rounded bg-line/50" />
          </div>
        ))}
      </div>
    </main>
  );
}
